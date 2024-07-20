import { moment } from "obsidian";
import { extractCurrentlocaleData } from "./moment";
import { PluginSettings } from "../contracts/config.types";
import { MomentDate } from "../contracts/date.types";
import { App } from "obsidian";

const CUSTOM_LOCALE = "custom-journal-locale";

export class CalendarHelper {
  constructor(private config: PluginSettings["calendar"]) {
    if (!moment.locales().includes(CUSTOM_LOCALE)) {
      const currentLocale = moment.locale();
      moment.defineLocale(CUSTOM_LOCALE, extractCurrentlocaleData());
      moment.locale(currentLocale);
    }
    this.updateLocale();
  }

  date(date?: string, format?: string): MomentDate {
    const md = date ? moment(date, format) : moment();
    if (this.config.firstDayOfWeek !== -1) {
      md.locale(CUSTOM_LOCALE);
    }
    return md;
  }

  today(): MomentDate {
    const md = moment();
    if (this.config.firstDayOfWeek !== -1) {
      md.locale(CUSTOM_LOCALE);
    }
    return md.startOf("day");
  }

  updateLocale(): void {
    const currentLocale = moment.locale();
    moment.updateLocale(CUSTOM_LOCALE, {
      week: {
        dow: this.config.firstDayOfWeek,
        doy: 7 + this.config.firstDayOfWeek - (this.config.firstWeekOfYear ?? 1),
      },
    });
    moment.locale(currentLocale);
  }

  hasContext(app: App, id: string): boolean {
    const path = this.config.contextPath;
    const file = app.vault.getFileByPath(path);
    if (!file) {
      return false;
    }
    const fm = app.metadataCache.getFileCache(file)?.frontmatter;
    if (!fm) {
      return false;
    }
    const defaultId = fm["journals.default.id"];

    return id == defaultId;
  }
}
