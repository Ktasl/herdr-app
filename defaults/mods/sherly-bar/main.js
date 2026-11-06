import { View, div, svg } from "gpui-kit";
import { h_flex } from "gpui-base";
import { spaces, run, theme, window } from "herdr";

export default class SherlyBar extends View {
  render() {
    const t = theme();
    const allSpaces = spaces();
    const stop = (_e, cx) => cx.stop_propagation();
    const isMac = window()?.platform === "macos" && !window()?.fullscreen;

    // Workspaces tabs
    const tabs = allSpaces.map((s, idx) => {
      const active = s.active;
      return h_flex()
        .id(`space-${s.id}`)
        .h(28)
        .px(10)
        .gap(7)
        .rounded(7)
        .items_center()
        .cursor_pointer()
        .bg(active ? (t.raised ?? "#343840") : (t.chrome ?? "#25282e"))
        .border_1()
        .border_color(active ? (t.border ?? "#484e5a") : "#00000000")
        .text_color(active ? (t.foreground ?? "#ffffff") : (t.muted ?? "#a3a7af"))
        .hover((st) => st.bg(t.hover))
        .on_mouse_down("left", stop)
        .on_click(() => run("space.switch", { space: s.id }))
        .child(div().text_size(12).font_medium().child(s.name || `Space ${idx + 1}`))
        .child(
          div()
            .size(16)
            .rounded_full()
            .bg(active ? (t.surface ?? "#202226") : (t.chrome ?? "#18191c"))
            .text_size(9.5)
            .font_bold()
            .text_color(active ? (t.foreground ?? "#ffffff") : (t.dim ?? "#71757e"))
            .flex()
            .items_center()
            .justify_center()
            .child(String(idx + 1)),
        );
    });

    return h_flex()
      .size_full()
      .pl(isMac ? 78 : 10)
      .pr(10)
      .items_center()
      .justify_between()
      .bg(t.chrome)
      .border_b(1)
      .border_color(t.border)
      // Left section: Tabs + Plus button
      .child(
        h_flex()
          .items_center()
          .gap(6)
          .child(h_flex().gap(6).items_center().children(tabs))
          .child(
            div()
              .size(24)
              .rounded(5)
              .text_color(t.dim)
              .flex()
              .items_center()
              .justify_center()
              .hover((st) => st.bg(t.hover).text_color(t.foreground))
              .on_mouse_down("left", stop)
              .on_click(() => run("space.new"))
              .child(svg("mods/workspace-chrome/plus.svg").size(12)),
          ),
      )
      // Right section: Minimalist CPU & RAM only
      .child(
        h_flex()
          .items_center()
          .gap(6)
          .text_size(11)
          .text_color(t.muted)
          .child(
            h_flex()
              .h(24)
              .px(8)
              .gap(5)
              .items_center()
              .rounded(6)
              .bg(t.raised)
              .border_1()
              .border_color(t.border)
              .child(div().text_color(t.accent ?? "#00acc1").child("⚙"))
              .child(div().child("CPU 54% · 12G")),
          ),
      );
  }
}
