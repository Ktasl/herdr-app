import { View, div, svg } from "gpui-kit";
import { v_flex } from "gpui-base";
import { run, theme, layout } from "herdr";

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

    const panelNode = find(l, "panel");
    const isPanelHidden = panelNode?.hidden ?? true;
    const panelBody = find(l, "panel-body");
    const activeTab = panelBody?.active ?? "spaces";

    const toggleTab = (tabName) => {
      if (isPanelHidden) {
        run("layout.select", { stack: "panel-body", child: tabName });
        run("layout.show", { id: "panel" });
      } else if (activeTab === tabName) {
        run("layout.hide", { id: "panel" });
      } else {
        run("layout.select", { stack: "panel-body", child: tabName });
      }
    };

    const iconBtn = (id, iconPath, title, isActive, onClick) =>
      div()
        .id(id)
        .size(32)
        .rounded(7)
        .cursor_pointer()
        .bg(isActive ? (t.selected ?? "#00000018") : "#00000000")
        .flex()
        .items_center()
        .justify_center()
        .text_color(isActive ? (t.foreground ?? "#2e3438") : (t.muted ?? "#756d61"))
        .hover((st) => st.bg(t.hover).text_color(t.foreground ?? "#2e3438"))
        .on_mouse_down("left", stop)
        .on_click(onClick)
        .child(svg(iconPath).size(18));

    return v_flex()
      .size_full()
      .py(8)
      .items_center()
      .justify_between()
      .bg(t.chrome)
      .border_l(1)
      .border_color(t.border)
      // Top group: Drawer toggles (Spaces, Agents, Files, Changes)
      .child(
        v_flex()
          .items_center()
          .gap(6)
          .child(
            iconBtn("btn-spaces", "mods/workspace-chrome/layers.svg", "工作區", !isPanelHidden && activeTab === "spaces", () => toggleTab("spaces"))
          )
          .child(
            iconBtn("btn-agents", "icons/agent.svg", "AI 代理", !isPanelHidden && activeTab === "agents", () => toggleTab("agents"))
          )
          .child(
            iconBtn("btn-files", "mods/workspace-chrome/folder.svg", "檔案清單", !isPanelHidden && activeTab === "files", () => toggleTab("files"))
          )
          .child(
            iconBtn("btn-changes", "mods/workspace-chrome/git-branch.svg", "Git 異動", !isPanelHidden && activeTab === "changes", () => toggleTab("changes"))
          )
      )
      // Bottom group: Remote host & Settings moved to bottom-right corner, just like Sherly!
      .child(
        v_flex()
          .items_center()
          .gap(6)
          .child(
            iconBtn("btn-machine-add", "mods/workspace-chrome/server.svg", "新增遠端主機", false, () => run("mod.open", { name: "machine-add" }))
          )
          .child(
            iconBtn("btn-settings", "mods/workspace-chrome/settings.svg", "偏好設定", false, () => run("app.settings"))
          )
      );
  }
}
