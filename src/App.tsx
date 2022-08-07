import React, { useEffect, useState } from "react";
import { fetch } from "@tauri-apps/api/http";
import getCurrentVersion, { getMinecraftFolder } from "./getCurrentVersion";
import { sendNotification } from "@tauri-apps/api/notification";
import { invoke } from "@tauri-apps/api/tauri";

function App() {
  const [status, setStatus] = useState("Перевірити на оновлення");
  const [btnStatus, setBtnStatus] = useState(false);
  const [latestVersion, setLatestVersion] = useState<number>(0);
  const [currentVersion, setCurrentVersion] = useState<number>(0);

  const [versions, setVersions] = useState<string[]>(["невідома", "невідома"]);

  useEffect(() => {
    let a: string[] = ["невідома", "невідома"];
    if (currentVersion !== 0) {
      a = [versions[0], currentVersion.toString()];
    }
    if (latestVersion !== 0) {
      a = [latestVersion.toString(), versions[1]];
    }
    setVersions(a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVersion, latestVersion]);

  const checkForUpdate = async (event: any) => {
    event.preventDefault();
    setBtnStatus(true);
    setStatus("Перевірка чи є оновлення...");
    const res: any = await fetch(
      "https://github.com/mrquantumoff/ualand-modpack-vc/raw/master/version.json",
      {
        method: "GET",
      }
    );
    if (!res.ok) {
      setStatus(
        "Помилка при підключенні до серверів оновлення. Спробуйте ще раз."
      );
      sendNotification({
        title: "Оновлення статусу",
        body: "Помилка при підключенні до серверів оновлення.",
      });
      setBtnStatus(false);
      return;
    }
    const latestversion = res?.data?.version;

    setLatestVersion(latestversion);
    if (latestversion > currentVersion) {
      console.log("Updating mods...");
      sendNotification({
        title: "Оновлення статусу",
        body: "Оновлення модів...",
      });
      setStatus("Завантаження модів...");
      let mcpath = await getMinecraftFolder();
      console.log("Started downloading");
      invoke("download_mc_mods", {
        mcpath: mcpath,
        version: latestversion.toString(),
      })
        .then(() => {
          sendNotification({
            title: "Оновлення статусу",
            body: "Оновлення модів...",
          });
          setStatus("Встановлення модів...");
          console.log("Finished downloading");
          invoke("install_mods", {
            version: latestversion.toString(),
            mcpath: mcpath,
          })
            .then(() => {
              setStatus("Моди встановлені");
              sendNotification({
                title: "Оновлення статусу",
                body: "Моди встановлені",
              });
              getCurVer();
            })
            .catch(() => {
              setStatus("Помилка при встановлені модів");
              setBtnStatus(false);
              sendNotification({
                title: "Оновлення статусу",
                body: "Помилка при встановлені модів",
              });
            });
        })
        .catch(() => {
          sendNotification({
            title: "Оновлення статусу",
            body: "Помилка при оновленні модів...",
          });
          setStatus("Помилка при оновленні модів...");
        });
      getCurVer();
    } else {
      sendNotification({ title: "Оновлення статусу", body: "Оновлень немає!" });
      setStatus("Оновлень немає!");
      setBtnStatus(false);
      getCurVer();
    }
  };

  const getCurVer = async () => {
    const currentversion = await getCurrentVersion(await getMinecraftFolder());

    setCurrentVersion(currentversion);
  };

  useEffect(() => {
    getCurVer();
  }, []);

  return (
    <>
      <div className="text-center block bg-slate-800 text-slate-50 main">
        <h1 className="">Менеджер оновлень UALand</h1>
        <form onSubmit={checkForUpdate}>
          <input
            type="submit"
            value={status}
            disabled={btnStatus}
            className="bg-slate-50 text-slate-800 btn rounded-2xl hover:rounded-lg transition-all ease-linear duration-200"></input>
        </form>
        <h2>Остання версія: {versions[0]}</h2>
        <h2>Встановлена версія: {versions[1]}</h2>
      </div>
    </>
  );
}

export default App;
