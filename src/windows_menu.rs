//! Windows Explorer context menu integration: adds "Open in Herdr" / "在 Herdr 中開啟"
//! to directory, directory background, and drive context menus.

#[cfg(windows)]
pub fn ensure_context_menu() {
    let _ = std::thread::Builder::new().name("windows-menu".into()).spawn(|| {
        let Ok(exe) = std::env::current_exe() else { return };
        let exe_str = exe.to_string_lossy();

        extern "system" {
            fn GetUserDefaultUILanguage() -> u16;
        }
        let is_chinese = unsafe { (GetUserDefaultUILanguage() & 0xFF) == 0x04 };
        let menu_text = if is_chinese { "在 Herdr 中開啟" } else { "Open in Herdr" };

        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        for subkey in ["Directory\\shell\\Herdr", "Directory\\Background\\shell\\Herdr", "Drive\\shell\\Herdr"] {
            let key = format!(r"HKCU\Software\Classes\{subkey}");
            let _ = std::process::Command::new("reg")
                .args(["add", &key, "/ve", "/d", menu_text, "/f"])
                .creation_flags(CREATE_NO_WINDOW)
                .status();
            let _ = std::process::Command::new("reg")
                .args(["add", &key, "/v", "Icon", "/d", &format!("\"{exe_str}\""), "/f"])
                .creation_flags(CREATE_NO_WINDOW)
                .status();
            let _ = std::process::Command::new("reg")
                .args(["add", &format!(r"{key}\command"), "/ve", "/d", &format!("\"{exe_str}\" \"%V\""), "/f"])
                .creation_flags(CREATE_NO_WINDOW)
                .status();
        }
    });
}

#[cfg(not(windows))]
#[allow(dead_code)]
pub fn ensure_context_menu() {}
