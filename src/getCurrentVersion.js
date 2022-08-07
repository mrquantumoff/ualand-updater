import { readTextFile as readFile } from "@tauri-apps/api/fs";
import { platform as Platform } from "@tauri-apps/api/os";
import { homeDir } from "@tauri-apps/api/path";
import { join } from "@tauri-apps/api/path";
export default async function getCurrentVersion(minecraftFolder) {
  let currentVersionFilePath = await join(
    await getMinecraftFolder(),
    "mods",
    "ualand.json"
  );
  const rawdata = await readFile(currentVersionFilePath);
  const data = JSON.parse(rawdata);
  return data.version || 0;
}

export async function getMinecraftFolder() {
  if (Platform === "Darwin") {
    return await join(
      await homeDir(),
      "Library",
      "Application Support",
      "minecraft"
    );
    //  "~/Library/Application Support/minecraft";
  } else if (Platform === "Windows_NT") {
    return await join(await homeDir(), "AppData", "Roaming", ".minecraft");
  } else {
    return await join(await homeDir(), ".minecraft");
  }
}
