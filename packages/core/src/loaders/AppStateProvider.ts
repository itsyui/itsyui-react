import WidgetsFactory from "../widgetsFactory";
import { ILocaleMessageProvider } from "@itsy-ui/core";

class AppStateProvider implements ILocaleMessageProvider {
	messageData: {};
	setLocaleData(messageData: {}) {
		this.messageData = messageData;
	}

	getLocaleData(key: string) {
		return this.messageData && this.messageData[key];
	}
}

WidgetsFactory.instance.registerService({
	appStateProvider: new AppStateProvider(),
});
