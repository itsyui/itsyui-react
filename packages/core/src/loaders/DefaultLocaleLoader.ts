import WidgetsFactory from "../widgetsFactory";
import { DataLoaderFactory, ILocaleLoader } from "@itsy-ui/core";

class DefaultLocaleLoader implements ILocaleLoader {
	_locale = "";

	getlocale() {
		return this._locale === "" ? navigator.language.split(/[-_]/)[0] : this._locale;
	}

	registerLocale(language: string) {
		this._locale = language;
	}
}

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
dataLoader.registerLoader({
	localeLoader: new DefaultLocaleLoader(),
});
