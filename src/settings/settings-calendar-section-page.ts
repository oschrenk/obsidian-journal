import { CalendarConfig, CalendarSection } from "../contracts/config.types";
import { App, ButtonComponent, Setting } from "obsidian";
import { FolderSuggestion } from "./ui/folder-suggestion";
import { IconSuggestion } from "./ui/icon-suggestion";
import { SettingsWidget } from "./settings-widget";
import { capitalize } from "../utils";
import { CalendarHelper } from "../utils/calendar";

export class SettingsCalendarSectionPage extends SettingsWidget {
  private folderSuggestions: FolderSuggestion[] = [];
  constructor(
    app: App,
    protected journal: CalendarConfig,
    protected containerEl: HTMLElement,
    protected config: CalendarSection,
    protected name: string,
    private calendar: CalendarHelper,
  ) {
    super(app);
  }

  display() {
    const { containerEl } = this;

    new Setting(containerEl)
      .setName(`${capitalize(this.name)} Notes`)
      .setHeading()
      .addButton((button) => {
        button
          .setClass("journal-clickable")
          .setIcon("chevron-left")
          .setTooltip("Back to journal")
          .onClick(() => {
            this.navigate({ type: "journal", id: this.journal.id });
          });
      });

    if (!this.config.enabled) return;

    new Setting(containerEl)
      .setName("Open note")
      .setDesc("Select how to open a note when navigating this journal")
      .addDropdown((dropdown) => {
        dropdown
          .addOptions({
            active: "Replacing active note",
            tab: "In new tab",
            split: "Adjusten to active note",
            window: "In popout window",
          })
          .setValue(this.config.openMode ?? "active")
          .onChange((value) => {
            this.config.openMode = value as CalendarSection["openMode"];
            this.save();
          });
      });

    const nameTemplate = new Setting(containerEl).setName("Note name template").addText((text) => {
      text.setValue(this.config.nameTemplate).onChange((value) => {
        this.config.nameTemplate = value;
        this.save();
      });
    });
    nameTemplate.descEl.createEl("span", {
      text: "Template used to generate new note name.",
    });
    nameTemplate.descEl.createEl("br");
    this.createVaribleReferenceHint(nameTemplate.descEl);

    const dateFormat = new Setting(containerEl).setName("Default date format").addMomentFormat((format) => {
      format.setValue(this.config.dateFormat).onChange((value) => {
        this.config.dateFormat = value;
        dateFormatHint.innerText = this.calendar.today().format(this.config.dateFormat);
        this.save();
      });
    });
    dateFormat.descEl.createEl("span", {
      text: "Used to format dates if not defined in variable.",
    });
    dateFormat.descEl.createEl("br");
    dateFormat.descEl.createEl("a", {
      text: "Syntax reference.",
      href: "https://momentjs.com/docs/#/displaying/format/",
    });
    dateFormat.descEl.createEl("br");
    dateFormat.descEl.createEl("span", {
      text: "Your current syntax looks like this: ",
    });
    const dateFormatHint = dateFormat.descEl.createEl("b", {
      cls: "u-pop",
    });
    dateFormatHint.innerText = this.calendar.today().format(this.config.dateFormat);

    const folder = new Setting(containerEl).setName("Folder").addText((text) => {
      this.folderSuggestions.push(new FolderSuggestion(this.app, text.inputEl, this.journal.rootFolder));
      text.setValue(this.config.folder).onChange((value) => {
        this.config.folder = value;
        this.save();
      });
    });

    folder.descEl.createEl("span", {
      text: "New notes will be created in this folder.",
    });
    folder.descEl.createEl("br");
    this.createVaribleReferenceHint(folder.descEl);

    const template = new Setting(containerEl).setName("Template").addText((text) => {
      text.setValue(this.config.template).onChange((value) => {
        this.config.template = value;
        this.save();
      });
    });
    template.descEl.createEl("span", {
      text: "Path to note that will be used as template when creating new notes. ",
    });
    template.descEl.createEl("br");
    this.createVaribleReferenceHint(template.descEl);
    template.descEl.createEl("br");
    this.createCodeBlockReferenceHint(template.descEl);

    new Setting(containerEl)
      .setName("Show in ribbon?")
      .setDesc("Changing ribbon settings requires Obsidian restart to take effect.")
      .addToggle((toggle) => {
        toggle.setValue(this.config.ribbon.show).onChange((value) => {
          this.config.ribbon.show = value;
          this.save(true);
        });
      });

    if (this.config.ribbon.show) {
      let iconPreivewButton: ButtonComponent | null = null;
      new Setting(containerEl)
        .setName("Ribbon icon")
        .setDesc("Select icon to be show in ribbon.")
        .addButton((button) => {
          iconPreivewButton = button;
          button.setIcon(this.config.ribbon.icon).setDisabled(true);
        })
        .addText((text) => {
          new IconSuggestion(this.app, text.inputEl);
          text.setValue(this.config.ribbon.icon).onChange((value) => {
            this.config.ribbon.icon = value;
            iconPreivewButton?.setIcon(value);
            this.save();
          });
        });
      new Setting(containerEl)
        .setName("Ribbon tooltip")
        .setDesc("Hint shown when hovering icon in ribbon")
        .addText((text) => {
          text
            .setValue(this.config.ribbon.tooltip)
            .setPlaceholder(`Open ${this.name} note`)
            .onChange((value) => {
              this.config.ribbon.tooltip = value;
              this.save();
            });
        });
    }

    new Setting(containerEl)
      .setName("Create note on startup")
      .setDesc("Automatically create notes whenever you open this vault.")
      .addToggle((toggle) => {
        toggle.setValue(this.config.createOnStartup ?? false).onChange((value) => {
          this.config.createOnStartup = value;
          this.save();
        });
      });
  }

  updateFolderSuggestions(root: string): void {
    for (const suggestion of this.folderSuggestions) {
      suggestion.root = root;
    }
  }

  createVaribleReferenceHint(el: HTMLElement): void {
    el.createEl("a", {
      text: "Supported variables.",
      href: "#",
    });
  }

  createCodeBlockReferenceHint(el: HTMLElement): void {
    el.createEl("a", {
      text: "Supported code blocks",
      href: "#",
    });
  }
}
