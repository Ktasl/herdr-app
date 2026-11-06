import { View, div, svg } from "gpui-kit";
import { v_flex } from "gpui-base";
import { run, theme, exec } from "herdr";

export default class SherlySidebar extends View {
  render() {
    const t = theme();
    const stop = (_e, cx) => cx.stop_propagation();

    // Standardized outline button helper: 32x32 hit area, uniform stroke style
    const iconBtn = (id, iconPath, title, onClick) =>
      div()
        .id(id)
        .size(32)
        .rounded(7)
        .cursor_pointer()
        .bg("#00000000")
        .flex()
        .items_center()
        .justify_center()
        .text_color(t.muted ?? "#756d61")
        .hover((st) => st.bg(t.hover).text_color(t.foreground ?? "#2e3438"))
        .on_mouse_down("left", stop)
        .on_click(onClick)
        .child(svg(iconPath).size(18));

    return v_flex()
      .size_full()
      .py(10)
      .items_center()
      .bg(t.chrome)
      .border_l(1)
      .border_color(t.border)
      // Top Tools Group (Pure outline icons, 4th and below reserved blank)
      .child(
        v_flex()
          .items_center()
          .gap(8)
          // 1. Spectra Button (Pure outline prism)
          .child(
            iconBtn("btn-spectra", "mods/sherly-sidebar/spectra.svg", "Spectra", () => {
              run("terminal.open", { argv: ["spectra", "cli"] });
            }),
          )
          // 2. Obsidian Button (Pure outline crystal facet)
          .child(
            iconBtn("btn-obsidian", "mods/sherly-sidebar/obsidian.svg", "Obsidian", () => {
              run("app.feedback", {});
              exec("open", ["obsidian://"]);
            }),
          )
          // 3. Folder Button (Pure outline folder)
          .child(
            iconBtn("btn-folder", "mods/workspace-chrome/folder.svg", "檔案瀏覽", () => {
              run("layout.select", { stack: "panel-body", child: "files" });
              run("layout.show", { id: "panel" });
            }),
          ),
      );
  }
}
