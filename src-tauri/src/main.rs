#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{fs::File, path::PathBuf};

#[tauri::command(async)]
fn download_mc_mods(version: &str, mcpath: &str) -> Result<(), ()> {
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
    if cfg!(windows) {
    } else {
        let child = std::process::Command::new("curl")
            .arg("-sLO")
            .arg("https://downloads.bultek.com.ua/mods-".to_owned() + version + ".zip")
            .current_dir(&mcpath)
            .status();
        match child {
            Ok(status) => {
                if status.success() {
                    return Ok(());
                } else {
                    return Err(());
                }
            }
            Err(_) => return Err(()),
        }
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
        let file = File::create(modfile);
        match file {
            Ok(file) => {
                let archive = zip::ZipArchive::new(file);
                match archive {
                    Ok(mut archive) => {
                        let finalres = archive.extract(&mcpath);
                        match finalres {
                            Ok(_) => return Ok(()),
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
