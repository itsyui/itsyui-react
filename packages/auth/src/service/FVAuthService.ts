import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IAuthResult, IAuthService, IConfigLoader } from "@itsy-ui/core";
import { setItemInLocalStorage, getItemFromLocalStorage, refreshToken, parseJWT, verifyJWT } from "@itsy-ui/utils";
import axios from "axios";
const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;

class AuthService implements IAuthService {
	async authenticate(username: string, password: string): Promise<IAuthResult> {
		const isOffline = window.navigator.onLine !== undefined && !window.navigator.onLine ? true : false;
		if (isOffline) {
			// allow user to continue
			return ({
				isAuthenticated: true,
				data: null,
			});
		}
		// handle online scenario
		const configData = dataLoader.getLoader<IConfigLoader>("config");
		const cfg = await configData.getConfig();
		// check if password is a token
		const JWT_TOKEN = parseJWT(password);
		if (JWT_TOKEN == null) {
			const body = {
				"email": username,
				"password": password,
			};
			try {
				const result = await axios.post(`${cfg['TenantURL']}/api/login`, body);
				if (result.data && result.data !== null && result.status === 200) {
					const userBTOA = btoa(`${username}:${result.data.token}`);
					setItemInLocalStorage("USER_LOCAL", userBTOA);
					setItemInLocalStorage("FV_TENANT_INFO", JSON.stringify(result.data));
					return ({
						isAuthenticated: true,
						data: null,
					});
				} else {
					return ({
						isAuthenticated: false,
						data: null,
					});
				}
			} catch (e) {
				return ({
					isAuthenticated: false,
					data: e.response.data,
				});
			}
		} else {
			let isAuthenticated = verifyJWT(password);
			if (!isAuthenticated) {
				let tenantInfo = getItemFromLocalStorage("FV_TENANT_INFO");
				// verify refresh token expiry and get the new token
				// if refreshToken is expired then user has to login
				if (Object.keys(tenantInfo).length > 0 && "refreshToken" in tenantInfo) {
					await refreshToken();
					// verify the token again so its not expired
					tenantInfo = getItemFromLocalStorage("FV_TENANT_INFO");
					isAuthenticated = verifyJWT(tenantInfo.token);
				}
			}
			return ({
				isAuthenticated: isAuthenticated,
				data: null,
			});
		}
	}

	logout(): any {
		localStorage.clear();
	}
}

dataLoader.registerLoader({
	"auth": new AuthService(),
});
