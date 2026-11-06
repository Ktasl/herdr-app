import { View, div, svg } from "gpui-kit";
import { h_flex } from "gpui-base";
import { spaces, theme, run } from "herdr";

export default class SherlyStatus extends View {
  render() {
    const t = theme();
    const space = spaces().find((s) => s.active);
    const branch = space?.branch || "master";
    const name = space?.name || "Workspace";
    const stop = (_e, cx) => cx.stop_propagation();

    return h_flex()
      .size_full()
      .px(14)
      .items_center()
      .justify_between()
      .bg(t.chrome)
      .border_t(1)
      .border_color(t.border)
      .text_size(11.5)
      .text_color(t.muted)
      // Left info: Folder + Branch
      .child(
        h_flex()
          .items_center()
          .gap(10)
          // Folder
          .child(
            h_flex()
              .gap(6)
              .items_center()
              .cursor_pointer()
              .hover((st) => st.text_color(t.foreground))
              .on_mouse_down("left", stop)
              .on_click(() => run("app.palette"))
              .child(svg("mods/workspace-chrome/folder.svg").size(13))
              .child(`Workspace/${name}`),
          )
          .child(div().text_color(t.dim).child("|"))
          // Branch
          .child(
            h_flex()
              .gap(5)
              .items_center()
              .child(svg("mods/workspace-chrome/git-branch.svg").size(13).text_color(t.accent ?? "#27c93f"))
              .child(div().font_bold().text_color(t.foreground).child(branch)),
          ),
      );
    // Right Sherly button removed completely per requirement 8!
  }
}
