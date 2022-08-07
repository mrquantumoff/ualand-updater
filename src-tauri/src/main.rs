#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{
    fs::{self, File},
    io::Write,
    path::PathBuf,
};

#[tauri::command]
async fn download_mc_mods(version: &str, mcpath: &str) -> Result<(), ()> {
    println!("downloading");
    let modp = PathBuf::from(mcpath).join("mods-".to_owned() + version + ".zip");
    if std::fs::metadata(&modp).is_ok() {
        let q = std::fs::remove_file(&modp);
        match q {
            Ok(()) => {}
            Err(_) => {
                println!("OnRemoveError");
                return Err(());
            }
        }
    }
    let file = File::create(modp);
    match file {
        Ok(mut f) => {
            let request =
                reqwest::get("https://dl.bultek.com.ua/mods-".to_owned() + version + ".zip").await;
            match request {
                Ok(mut request) => {
                    while let Some(chunk) =
                        request.chunk().await.expect("Error while loading chunks")
                    {
                        let res = f.write_all(&chunk);
                        match res {
                            Ok(_) => {}
                            Err(_) => return Err(()),
                        }
                    }
                }
                Err(_) => return Err(()),
            }
        }
        Err(_) => return Err(()),
    }

    Ok(())
}

#[tauri::command]
async fn install_mods(version: &str, mcpath: &str) -> Result<(), ()> {
    let modp = PathBuf::from(mcpath).join("mods");
    if std::fs::metadata(&modp).is_ok() {
        let res = std::fs::rename(
            &modp,
            PathBuf::from(&mcpath)
                .join("mods-".to_owned() + chrono::offset::Utc::now().to_string().as_ref()),
        );
        match res {
            Ok(_) => {}
            Err(_) => {
                println!("OnRenameError (86)");
                return Err(());
            }
        }
    }
    let moda = PathBuf::from(mcpath).join("mods-".to_owned() + version + ".zip");
    let moda = moda.to_str();
    if let Some(modfile) = moda {
        let file = File::open(modfile);
        match file {
            Ok(file) => {
                let archive = zip::ZipArchive::new(file);
                match archive {
                    Ok(mut archive) => {
                        let finalres = archive.extract(&mcpath);
                        match finalres {
                            Ok(_) => {
                                let cleanupres = fs::remove_file(moda.unwrap());
                                match cleanupres {
                                    Ok(()) => return Ok(()),
                                    Err(_) => return Err(()),
                                }
                            }
                            Err(_) => {
                                println!("");
                                return Err(());
                            }
                        }
                    }
                    Err(_) => {
                        println!("UnZipError (109)");
                        return Err(());
                    }
                }
            }
            Err(_) => {
                println!("ArchiveError(115)");
                return Err(());
            }
        }
    } else {
        {
            println!("NoFileError");
            return Err(());
        };
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![download_mc_mods, install_mods])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
