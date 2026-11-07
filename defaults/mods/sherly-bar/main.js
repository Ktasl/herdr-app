import { View, div, svg } from "gpui-kit";
import { h_flex } from "gpui-base";
import { spaces, panes, run, theme, window, home, openOverlay } from "herdr";

function getTabTitle(tab, allPanes, currentSpace, idx) {
  // If explicitly renamed by user, use that name
  const isCustom = tab.named && tab.name && !/^\d+$/.test(tab.name) && !/^tb\d+$/.test(tab.name);
  if (isCustom) return tab.name;

  const tabPanes = allPanes.filter((p) => p.tab === tab.id);
  const pane = tabPanes.find((p) => p.focused) ?? tabPanes[0];

  if (pane?.cwd) {
    const h = home();
    if (pane.cwd === h) {
      if (currentSpace?.name && currentSpace.name !== "~") return currentSpace.name;
      return "~";
    }
    const parts = pane.cwd.replace(/\/+$/, "").split("/").filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  if (pane?.title && pane.title !== "Terminal" && pane.title !== "zsh" && pane.title !== "bash") {
    return pane.title;
  }

  if (currentSpace?.name && currentSpace.name !== "~") {
    return currentSpace.name;
  }

  return `Terminal ${idx + 1}`;
}

export default class SherlyBar extends View {
  init() {
    this.hoveredTab = null;
  }

  render() {
    const t = theme();
    const currentSpace = spaces().find((s) => s.active);
    const currentTabs = currentSpace?.tabs ?? [];
    const allPanes = panes();
    const stop = (_e, cx) => cx.stop_propagation();
    const isMac = window()?.platform === "macos" && !window()?.fullscreen;

    // Terminal tabs inside the active workspace
    const tabs = currentTabs.map((tab, idx) => {
      const active = tab.active;
      const isHovered = this.hoveredTab === tab.id;
      const name = getTabTitle(tab, allPanes, currentSpace, idx);

      return h_flex()
        .id(`tab-${tab.id}`)
        .h(28)
        .pl(10)
        .pr(6)
        .gap(7)
        .rounded(7)
        .items_center()
        .cursor_pointer()
        .bg(active ? (t.raised ?? "#343840") : (t.chrome ?? "#25282e"))
        .border_1()
        .border_color(active ? (t.border ?? "#484e5a") : "#00000000")
        .text_color(active ? (t.foreground ?? "#ffffff") : (t.muted ?? "#a3a7af"))
        .hover((st) => st.bg(t.hover))
        .on_hover((hovered, cx) => {
          const next = hovered ? tab.id : null;
          if (this.hoveredTab !== next) {
            this.hoveredTab = next;
            cx.notify();
          }
        })
        .on_mouse_down("left", (e, cx) => {
          cx.stop_propagation();
          if (e.click_count === 2) run("tab.rename", { id: tab.id });
        })
        .on_mouse_down("right", (_e, cx) => {
          cx.stop_propagation();
          if (currentSpace) {
            openOverlay({
              mod: "menu",
              kind: "popup",
              width: 200,
              props: { tab: "tab", target: { id: tab.id, space: currentSpace.id } },
            });
          }
        })
        .on_click(() => run("tab.select", { id: tab.id }))
        .child(
          div()
            .text_size(12)
            .font_medium()
            .text_color(active ? (t.foreground ?? "#ffffff") : (t.muted ?? "#a3a7af"))
            .child(name),
        )
        // Right circular badge: '×' close button when active or hovered; index number when inactive
        .child(
          isHovered || active
            ? div()
                .id(`tab-close-${tab.id}`)
                .size(18)
                .rounded_full()
                .bg(active ? (t.surface ?? "#202226") : (t.raised ?? "#282a2e"))
                .flex()
                .items_center()
                .justify_center()
                .cursor_pointer()
                .text_color(t.dim ?? "#8b8f95")
                .hover((s) => s.bg(t.hover).text_color(t.foreground))
                .on_mouse_down("left", stop)
                .on_click((_e, cx) => {
                  cx.stop_propagation();
                  run("tab.close", { id: tab.id, confirmed: true });
                })
                .child(svg("mods/workspace-chrome/x.svg").size(10))
            : div()
                .size(18)
                .rounded_full()
                .bg(t.surface ?? "#202226")
                .text_size(10)
                .font_medium()
                .text_color(t.dim ?? "#71757e")
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
      // Left section: Terminal Tabs + Plus button (new terminal)
      .child(
        h_flex()
          .items_center()
          .gap(6)
          .child(h_flex().gap(6).items_center().children(tabs))
          .child(
            div()
              .id("btn-tab-new")
              .size(24)
              .rounded(5)
              .text_color(t.dim)
              .cursor_pointer()
              .flex()
              .items_center()
              .justify_center()
              .hover((st) => st.bg(t.hover).text_color(t.foreground))
              .on_mouse_down("left", stop)
              .on_click(() => {
                const focusedCwd = allPanes.find((p) => p.focused)?.cwd;
                run("tab.new", focusedCwd ? { folder: focusedCwd } : {});
              })
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
