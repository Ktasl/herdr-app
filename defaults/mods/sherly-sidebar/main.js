import { View, div, svg } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { run, theme, layout, updates } from "herdr";

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

export default class SherlySidebar extends View {
  render() {
    const t = theme();
    const l = layout();
    const stop = (_e, cx) => cx.stop_propagation();
    const ver = updates()?.app?.version ?? "0.1.13";

    const panelNode = find(l, "panel");
    const isPanelHidden = panelNode?.hidden ?? false;

    const spacesNode = find(l, "drawer-spaces");
    const isSpacesVisible = !isPanelHidden && spacesNode && !spacesNode.hidden;

    const agentsNode = find(l, "drawer-agents");
    const isAgentsVisible = !isPanelHidden && agentsNode && !agentsNode.hidden;

    const filesNode = find(l, "drawer-files");
    const isFilesVisible = !isPanelHidden && filesNode && !filesNode.hidden;

    const changesNode = find(l, "drawer-changes");
    const isChangesVisible = !isPanelHidden && changesNode && !changesNode.hidden;

    const toggleSection = (id) => {
      const node = find(layout(), id);
      const isVisible = !find(layout(), "panel")?.hidden && node && !node.hidden;

      if (isVisible) {
        // Count how many are currently visible
        const allIds = ["drawer-spaces", "drawer-agents", "drawer-files", "drawer-changes"];
        const visibleCount = allIds.filter((x) => {
          const n = find(layout(), x);
          return n && !n.hidden;
        }).length;

        if (visibleCount <= 1) {
          // If this was the last visible section, hide the whole panel
          run("layout.hide", { id: "panel" });
          run("layout.hide", { id });
        } else {
          run("layout.hide", { id });
        }
      } else {
        run("layout.show", { id: "panel" });
        run("layout.show", { id });
      }
    };

    const iconBtn = (id, iconPath, title, isPinned, onClick) =>
      div()
        .id(id)
        .size(32)
        .rounded(7)
        .relative()
        .cursor_pointer()
        .bg(isPinned ? (t.selected ?? "#00000018") : "#00000000")
        .flex()
        .items_center()
        .justify_center()
        .text_color(isPinned ? (t.foreground ?? "#2e3438") : (t.muted ?? "#756d61"))
        .hover((st) => st.bg(t.hover).text_color(t.foreground ?? "#2e3438"))
        .on_mouse_down("left", stop)
        .on_click(onClick)
        .child(svg(iconPath).size(18))
        .when(isPinned, (el) =>
          el.child(
            div()
              .size(5)
              .rounded_full()
              .bg(t.accent ?? "#d67750")
              .absolute()
              .top(3)
              .right(3),
          ),
        );

    return v_flex()
      .size_full()
      .py(8)
      .items_center()
      .justify_between()
      .bg(t.chrome)
      .border_l(1)
      .border_color(t.border)
      // Top group: Multi-panel Pin toggles (Spaces, Agents, Files, Changes)
      .child(
        v_flex()
          .items_center()
          .gap(6)
          .child(
            iconBtn(
              "btn-spaces",
              "mods/workspace-chrome/layers.svg",
              "釘選 / 收合工作區",
              isSpacesVisible,
              () => toggleSection("drawer-spaces"),
            ),
          )
          .child(
            iconBtn(
              "btn-agents",
              "icons/agent.svg",
              "釘選 / 收合 AI 代理",
              isAgentsVisible,
              () => toggleSection("drawer-agents"),
            ),
          )
          .child(
            iconBtn(
              "btn-files",
              "mods/workspace-chrome/folder.svg",
              "釘選 / 收合檔案清單",
              isFilesVisible,
              () => toggleSection("drawer-files"),
            ),
          )
          .child(
            iconBtn(
              "btn-changes",
              "mods/workspace-chrome/git-branch.svg",
              "釘選 / 收合 Git 異動",
              isChangesVisible,
              () => toggleSection("drawer-changes"),
            ),
          ),
      )
      // Bottom group: Remote host & Settings moved to bottom-right corner, just like Sherly!
      .child(
        v_flex()
          .items_center()
          .gap(6)
          .child(
            iconBtn("btn-machine-add", "mods/workspace-chrome/server.svg", "新增遠端主機", false, () =>
              run("mod.open", { name: "machine-add" }),
            ),
          )
          .child(
            iconBtn("btn-settings", "mods/workspace-chrome/settings.svg", "偏好設定", false, () =>
              run("app.settings"),
            ),
          )
          .child(
            div()
              .id("btn-version")
              .pt(2)
              .text_size(9)
              .font_medium()
              .text_color(t.dim ?? t.muted)
              .cursor_pointer()
              .hover((s) => s.text_color(t.foreground))
              .on_mouse_down("left", stop)
              .on_click(() => run("app.settings", { section: "updates" }))
              .child(`v${ver}`),
          ),
      );
  }
}
