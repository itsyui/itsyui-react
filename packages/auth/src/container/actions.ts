import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IAuthService, IConfigLoader } from "@itsy-ui/core";
import axios from "axios";
import { defaultForgotPasswordSchema, defaultSignupSchema, defaultUserVerificationSchema } from "./defaultSchema";
import { getLoginSchema, getSignupSchema } from "./utils";
const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
export const TenantLoginActions = {
	"State": {
		"AppActions": {
			"AUTH_SUCCESS": "AUTH_SUCCESS",
		},
		"formState": {
			"FORM_SUBMIT_CLICK": "FORM_SUBMIT_CLICK",
			"NAVIGATE_URL": "NAVIGATE_URL",
		},
		"TENANT_ERROR_DONE": "TENANT_ERROR_DONE",
		"VERIFY_OTP_DONE": "VERIFY_OTP_DONE",
		"SIGNUP_DONE": "SIGNUP_DONE",
		"FORGOT_DONE": "FORGOT_DONE",
		"TENANT_SHOW_SIGNUP": "TENANT_SHOW_SIGNUP",
		"TENANT_SHOW_VERIFICATION": "TENANT_SHOW_VERIFICATION",
		"TENANT_SHOW_FORGOT": "TENANT_SHOW_FORGOT",
		"TENANT_SHOW_LOGIN": "TENANT_SHOW_LOGIN",
		"TENANT_SHOW_RESET": "TENANT_SHOW_RESET",
		"TENANT_AUTH_FORM_BEFORE_LOGIN_RENDER": "TENANT_AUTH_FORM_BEFORE_LOGIN_RENDER",
		"TENANT_AUTH_FORM_AFTER_LOGIN_RENDER": "TENANT_AUTH_FORM_AFTER_LOGIN_RENDER",
		"TENANT_AUTH_FORM_LOGIN": "TENANT_AUTH_FORM_LOGIN",
		"TENANT_AUTH_FORM_DONE": "TENANT_AUTH_FORM_DONE",
		"TENANT_AUTH_FORM_LOGIN_SUCCESS": "TENANT_AUTH_FORM_LOGIN_SUCCESS",
		"TENANT_AUTH_FORM_AFTER_SIGNUP_RENDER": "TENANT_AUTH_FORM_AFTER_SIGNUP_RENDER",
		"TENANT_AUTH_CONFIRM_USER_FORM": "TENANT_AUTH_CONFIRM_USER_FORM",
		"TENANT_AUTH_FORM_AFTER_FORGOT_PASSWORD_RENDER": "TENANT_AUTH_FORM_AFTER_FORGOT_PASSWORD_RENDER",
		"TENANT_ERROR": "TENANT_ERROR",
		"TENANT_CANCEL_BTN": "TENANT_CANCEL_BTN",
		"VERIFY_OTP_BEFORE_RENDER": "VERIFY_OTP_BEFORE_RENDER",
		"TENANT_AUTH_FORM_AFTER_VERIFICATION_RENDER": "TENANT_AUTH_FORM_AFTER_VERIFICATION_RENDER",
		TENANT_AUTH_FORM_BEFORE_SIGNUP_RENDER: "TENANT_AUTH_FORM_BEFORE_SIGNUP_RENDER",
		TENANT_AUTH_FORM_BEFORE_FORGOT_PASSWORD_RENDER: "TENANT_AUTH_FORM_BEFORE_FORGOT_PASSWORD_RENDER",
	},
	"AppSchema": "TenantLoginActions.AppSchema",
	"UpdateControlSchema": "TenantLoginActions.UpdateControlSchema",
	"UpdateErrorMessage": "TenantLoginActions.UpdateErrorMessage",
	"UpdateProperties": "TenantLoginActions.UpdateProperties",
	"view": {
		"TENANT_Login": "TENANT_SHOW_LOGIN",
		"TENANT_Signup": "TENANT_SHOW_SIGNUP",
		"TENANT_Forgot": "TENANT_SHOW_FORGOT",
		"TENANT_Reset": "TENANT_SHOW_RESET",
		"TENANT_Verify": "TENANT_SHOW_VERIFICATION",
	},
};

export function doFormSignup(data: any) {
	return async (getState: any, _dispatch: any, transition: any) => {
		const { properties } = getState();
		const { showLoadingIndicator } = properties;
		if (showLoadingIndicator) {
			setTimeout(() => {
				transition({
					type: "SHOW_INDICATOR",
					loadingMessage: "{{login.submittingRequest}}",
				});
			}, 100);
		}
		let attributes: any = [];
		const value = Object.assign({}, ...Object.keys(data).map((t: any) => {
			if (t.match(/companyName/g) != null) {
				return {
					companyName: data[t],
				};
			} else if (t.match(/companyEmail/g) != null) {
				return {
					companyEmail: data[t],
				};
			} else {
				function getCamelCase(str: any) {  //because in db we have keys in camelCase
					return str.replace(/\s(.)/g, function ($1: any) { return $1.toUpperCase(); })
						.replace(/\s/g, "")
						.replace(/^(.)/, function ($1: any) { return $1.toLowerCase(); });
				}
				attributes.push({
					[getCamelCase(t.split(":").pop())]: data[t],
				});
				return undefined;
			}
		}));
		attributes = Object.assign({}, ...attributes);
		const body = {
			...value,
			"isDefaultRepo": true,
			"userAttributes": attributes,
		};

		const configData = dataLoader.getLoader<IConfigLoader>("config");
		try {
			const cfg = await configData.getConfig();
			const apiResp = await axios.post(`${cfg['TenantURL']}/api/signup`, body);
			if (apiResp.data && apiResp.data !== null) {
				transition({ type: TenantLoginActions.State.SIGNUP_DONE });
				transition({
					type: TenantLoginActions.State.formState.NAVIGATE_URL,
					url: `/verification?em=${btoa(value.companyEmail)}`,
				});
			}
			if (showLoadingIndicator) {
				transition({
					type: "HIDE_INDICATOR",
				});
			}
		} catch (e) {
			const errorMessage = e.response.data !== null ? e.response.data.errorMessage : e.message;
			const errorCode = e.response.data !== null ? e.response.data.errorCode : null;
			transition({
				type: TenantLoginActions.State.TENANT_ERROR,
				data: errorMessage,
				errorCode,
			});
			if (showLoadingIndicator) {
				transition({
					type: "HIDE_INDICATOR",
				});
			}
		}
	};
}

export function doFormForgotPassword(data: any) {
	return async (getState: any, _dispatch: any, transition: any) => {
		const { properties } = getState();
		const { showLoadingIndicator } = properties;
		if (showLoadingIndicator) {
			setTimeout(() => {
				transition({
					type: "SHOW_INDICATOR",
					loadingMessage: "{{login.submittingRequest}}",
				});
			}, 100);
		}
		const body = Object.assign({}, ...Object.keys(data).map((t: any) => {
			if (t.match(/email/g) != null) {
				return {
					email: data[t],
				};
			}

			return undefined;
		}));
		const configData = dataLoader.getLoader<IConfigLoader>("config");
		try {
			const cfg = await configData.getConfig();
			const apiResp = await axios.post(`${cfg['TenantURL']}/api/forgotpassword`, body);
			transition({ type: TenantLoginActions.State.FORGOT_DONE });
			transition({
				type: TenantLoginActions.State.formState.NAVIGATE_URL,
				url: `/verification?em=${btoa(body["email"])}`,
			});
			// transition({ type: TenantLoginActions.State.TENANT_AUTH_CONFIRM_USER_FORM });
			if (showLoadingIndicator) {
				transition({
					type: "HIDE_INDICATOR",
				});
			}
		} catch (e) {
			const errorMessage = e.response.data !== null ? e.response.data.errorMessage : e.message;
			const errorCode = e.response.data !== null ? e.response.data.errorCode : null;
			transition({
				type: TenantLoginActions.State.TENANT_ERROR,
				data: errorMessage,
				errorCode,
			});
			if (showLoadingIndicator) {
				transition({
					type: "HIDE_INDICATOR",
				});
			}
		}
	};
}

export function doVerifyOtp(data: any) {
	return async (getState: any, _dispatch: any, transition: any) => {
		const { properties } = getState();
		const { showLoadingIndicator } = properties;
		if (showLoadingIndicator) {
			setTimeout(() => {
				transition({
					type: "SHOW_INDICATOR",
					loadingMessage: "{{login.submittingRequest}}",
				});
			}, 100);
		}
		const body = Object.assign({}, ...Object.keys(data).map(t => {
			if (t.match(/email/g) != null) {
				return {
					email: data[t],
				};
			} else if (t.match(/confirmationCode/g) != null) {
				return {
					confirmationCode: data[t],
				};
			} else if (t.match(/password/g) != null) {
				return {
					password: data[t],
				};
			}

			return undefined;
		}));
		const headers = {
			"Content-Type": "application/json",
		};
		const configData = dataLoader.getLoader<IConfigLoader>("config");
		try {
			const cfg = await configData.getConfig();
			const apiResp = await axios.post(`${cfg['TenantURL']}/api/confirm`, body, { headers: headers });
			transition({ type: TenantLoginActions.State.VERIFY_OTP_DONE });
			transition({
				type: TenantLoginActions.State.formState.NAVIGATE_URL,
				url: "/login",
			});
			transition({ type: TenantLoginActions.State.TENANT_AUTH_FORM_BEFORE_LOGIN_RENDER });
			if (showLoadingIndicator) {
				transition({
					type: "HIDE_INDICATOR",
				});
			}
		} catch (e) {
			const errorMessage = e.response.data !== null ? e.response.data.errorMessage : e.message;
			const errorCode = e.response.data !== null ? e.response.data.errorCode : null;
			transition({
				type: TenantLoginActions.State.TENANT_ERROR,
				data: errorMessage,
				errorCode,
			});
			if (showLoadingIndicator) {
				transition({
					type: "HIDE_INDICATOR",
				});
			}
		}
	};
}

export function doTenantShowError(data: any, _errorCode?: string) {
	return async (_getState: any, dispatch: any, transition: any) => {
		transition({
			type: TenantLoginActions.State.TENANT_ERROR_DONE,
		});
		dispatch(updateLoginError(data));
	};
}

export function doFormConfirmUser(data) {
	return (_getState: any, _dispatch: any, transition: any) => {
		transition({ type: TenantLoginActions.State.VERIFY_OTP_BEFORE_RENDER, logo: data.logo });
	};
}
export function doFormBeforeVerificationRender(data) {
	return (_getState: any, _dispatch: any, transition: any) => {
		const verifySchema = {
			...defaultUserVerificationSchema.properties,
			logo: data.logo === undefined ? undefined : data.logo,
		}
		const verificaitonSchema = {
			"name": defaultUserVerificationSchema.name,
			"properties": {
				...verifySchema,
			},
		};
		transition({
			type: TenantLoginActions.State.TENANT_AUTH_FORM_AFTER_VERIFICATION_RENDER,
			verificaitonSchema: verificaitonSchema,
		});
	};
}

export function doFormAfterVerificationRender(controlSchema: any) {
	return (_getState: any, dispatch: any, transition: any) => {
		transition({
			type: TenantLoginActions.State.TENANT_AUTH_FORM_DONE,
		});
		dispatch(updateControlSchema(controlSchema, TenantLoginActions.State.TENANT_SHOW_VERIFICATION));
	};
}

export function doFormBeforeForgotPasswordRender(data) {
	return (_getState: any, _dispatch: any, transition: any) => {
		const forgotSchema = {
			...defaultForgotPasswordSchema.properties,
			logo: data.logo === undefined ? undefined : data.logo,
		}
		const forgotPasswordSchema = {
			"name": defaultForgotPasswordSchema.name,
			"properties": {
				...forgotSchema,
			},
		};
		transition({
			type: TenantLoginActions.State.TENANT_AUTH_FORM_AFTER_FORGOT_PASSWORD_RENDER,
			forgotPasswordSchema: forgotPasswordSchema,
		});
	};
}

export function doFormAfterForgotPasswordRender(controlSchema: any) {
	return (_getState: any, dispatch: any, transition: any) => {
		transition({
			type: TenantLoginActions.State.TENANT_AUTH_FORM_DONE,
		});
		dispatch(updateControlSchema(controlSchema, TenantLoginActions.State.TENANT_SHOW_FORGOT));
	};
}

export function doFormBeforeSignupRender(data: any) {
	return async (_getState, _dispatch, transition) => {

		if (data.signupFormSchemaId) {
			const signupFormSchema = {
				"name": "signup_page",
				"properties": {
					"ui:widget": "form",
					"header": "Signup Form",
					"typeId": "auth",
					"isModal": true,
					"formSchemaId": data.signupFormSchemaId,
				},
			};
			transition({
				type: TenantLoginActions.State.TENANT_AUTH_FORM_AFTER_SIGNUP_RENDER,
				signupSchema: signupFormSchema,
			});
		} else {
			const signupFormSchema = getSignupSchema(data.logo === undefined ? undefined : data.logo)
			transition({
				type: TenantLoginActions.State.TENANT_AUTH_FORM_AFTER_SIGNUP_RENDER,
				signupSchema: signupFormSchema

			});
		}
	};
}

export function doFormAfterSignupRender(controlSchema: any) {
	return (_, dispatch, transition) => {
		transition({
			type: TenantLoginActions.State.TENANT_AUTH_FORM_DONE,
		});
		dispatch(updateControlSchema(controlSchema, TenantLoginActions.State.TENANT_SHOW_SIGNUP));
	};
}

export function doLoginFailureShowError(error: any): any {
	return (_, dispatch, _transition) => {
		dispatch(updateLoginError(error));
	};
}

export function updateLoginError(error: any) {
	return {
		type: TenantLoginActions.UpdateErrorMessage,
		errorMessage: error,
	};
}

export function doLoginSubmit(username: string, password: string) {
	return (getState, _dispatch: any, transition: any) => {
		const { properties } = getState();
		const { showLoadingIndicator } = properties;
		const authService = dataLoader.getLoader<IAuthService>("auth");
		if (showLoadingIndicator) {
			setTimeout(() => {
				transition({
					type: "SHOW_INDICATOR",
					loadingMessage: "{{login.loginLoading}}",
				});
			}, 100);
		}
		authService.authenticate(username, password)
			.then(authResult => {
				if (authResult.isAuthenticated) {
					const authSuccess = { "fromLogin": true, ...authResult };
					transition({
						type: TenantLoginActions.State.TENANT_AUTH_FORM_LOGIN_SUCCESS,
					});
					transition({
						type: TenantLoginActions.State.AppActions.AUTH_SUCCESS,
						"authResult": authSuccess,
					});
					if (showLoadingIndicator) {
						transition({
							type: "HIDE_INDICATOR",
						});
					}
				} else {
					transition({
						type: TenantLoginActions.State.TENANT_ERROR,
						data: authResult.data.errorMessage,
						errorCode: authResult.data.errorCode ? authResult.data.errorCode : authResult.data.status === 401 ? authResult.data.status : undefined,
					});
					if (showLoadingIndicator) {
						transition({
							type: "HIDE_INDICATOR",
						});
					}
				}
			})
			.catch(e => {
				transition({
					type: TenantLoginActions.State.TENANT_ERROR,
					data: e.message,
				});
				if (showLoadingIndicator) {
					transition({
						type: "HIDE_INDICATOR",
					});
				}
			});
	};
}

export function doRedirectToVerification(): any {
	return {
		type: TenantLoginActions.State.TENANT_SHOW_VERIFICATION,
		loginSchema: defaultUserVerificationSchema,
	};
}

function navigateToURL(url: string, type: string) {
	return {
		type,
		url,
	};
}

export function doNavigateToLogin(_history: any, action: string) {
	return (_, dispatch: any) => {
		dispatch(navigateToURL(action, TenantLoginActions.view.TENANT_Login));
	};
}

export function doNavigateToSignup(_history: any, action: string) {
	return (_, dispatch: any) => {
		dispatch(navigateToURL(action, TenantLoginActions.view.TENANT_Signup));
	};
}

export function doNavigateToForgot(_history: any, action: string) {
	return (_, dispatch: any) => {
		dispatch(navigateToURL(action, TenantLoginActions.view.TENANT_Forgot));
	};
}

export function doNavigateToVerification(_history: any, action: string) {
	return (_, dispatch: any) => {
		dispatch(navigateToURL(action, TenantLoginActions.view.TENANT_Verify));
	};
}

export function doNavigateToResetpassword(_history: any, action: string) {
	return (_, dispatch: any) => {
		dispatch(navigateToURL(action, TenantLoginActions.view.TENANT_Reset));
	};
}

export function doFormBeforeLoginRender(data: any): any {
	return async (getState, _dispatch, transition) => {
		const { properties } = getState();
		const showForgotPasswordButton = data.showForgotPasswordButton === undefined ? properties.showForgotPassword : data.showForgotPasswordButton;
		const showSignupButton = data.showSignupButton === undefined ? properties.showSignup : data.showSignupButton;
		const signupFormSchemaId = data.signupFormSchemaId === undefined ? data.signupFormSchemaId : undefined;
		const logo = data.logo === undefined ? undefined : data.logo;
		if (data.loginFormSchemaId) {
			const loginSchema = {
				"name": "login_page",
				"properties": {
					"ui:widget": "login",
					"formSchemaId": data.loginFormSchemaId,
					showForgotPasswordButton: showForgotPasswordButton,
					showSignupButton: showSignupButton,
					signupFormSchemaId: signupFormSchemaId,
					logo: logo,
				},
			};
			transition({
				type: TenantLoginActions.State.TENANT_AUTH_FORM_AFTER_LOGIN_RENDER,
				loginSchema: loginSchema,
			});
		} else {
			const loginSchema = getLoginSchema(showForgotPasswordButton, showSignupButton, signupFormSchemaId, logo);
			transition({
				type: TenantLoginActions.State.TENANT_AUTH_FORM_AFTER_LOGIN_RENDER,
				loginSchema: loginSchema,
			});
		}
	}
}

export function doFormAfterLoginRender(controlSchema: any) {
	return async (_, dispatch, transition) => {
		transition({
			type: TenantLoginActions.State.TENANT_AUTH_FORM_DONE,
		});
		dispatch(updateControlSchema(controlSchema, TenantLoginActions.State.TENANT_SHOW_LOGIN));

	};
}

function updateControlSchema(controlSchema: any, view: any) {
	switch (view) {
		case "TENANT_SHOW_LOGIN":
			return {
				type: TenantLoginActions.UpdateControlSchema,
				controlSchema,
				page: TenantLoginActions.view.TENANT_Login,
			};
		case "TENANT_SHOW_SIGNUP":
			return {
				type: TenantLoginActions.UpdateControlSchema,
				controlSchema,
				page: TenantLoginActions.view.TENANT_Signup,
			};
		case "TENANT_SHOW_FORGOT":
			return {
				type: TenantLoginActions.UpdateControlSchema,
				controlSchema,
				page: TenantLoginActions.view.TENANT_Forgot,
			};
		case "TENANT_SHOW_VERIFICATION":
			return {
				type: TenantLoginActions.UpdateControlSchema,
				controlSchema,
				page: TenantLoginActions.view.TENANT_Verify,
			};
		default:
			return {
				type: TenantLoginActions.UpdateControlSchema,
				controlSchema,
				page: TenantLoginActions.view.TENANT_Login,
			};
	}
}

export function onUpdateProperties(value: any) {
	return {
		type: TenantLoginActions.UpdateProperties,
		value: value,
	};
}
