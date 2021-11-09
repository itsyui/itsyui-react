import WidgetsFactory from "../widgetsFactory";
import { IAuthService, IAuthResult, DataLoaderFactory, IConfigLoader } from "@itsy-ui/core";
const cmis = require("cmis");

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
function setItemInLocalStorage(key: string, value: any) {
	if (typeof Storage !== undefined) {
		localStorage.setItem(key, value);
	}
}

function removeInLocalStorage(key: string) {
	if (typeof Storage !== undefined) {
		localStorage.removeItem(key);
	}
}

class AuthService implements IAuthService {
	authenticate(username: string, password: string): Promise<IAuthResult> {
		return new Promise((resolve, reject) => {
			const configData = dataLoader.getLoader<IConfigLoader>("config");
			configData.getConfig()
				.then(cfg => {
					const session = new cmis.CmisSession(cfg.CmisURL);
					session.setCredentials(username, password);
					const userBTOA = btoa(`${username}:${password}`);
					setItemInLocalStorage("USER_LOCAL", userBTOA);
					session.loadRepositories()
						.then(() => {
							resolve({
								isAuthenticated: true,
								data: session,
							});
						})
						.catch(reject);
				}).catch(reject);
		});
	}

	logout(): any {
		removeInLocalStorage("USER_LOCAL");
	}
}

dataLoader.registerLoader({
	"auth": new AuthService(),
});
