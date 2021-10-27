export const RegExPatterns = {
	GUID: /(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/g,
	SquareBracket: /{([^}]+)}/g,
};

export const getWidgetId = (currentPage, controlID, feature) => {
	let widgetId;
	if (controlID && feature && currentPage) {
		widgetId = Object.keys(currentPage["components"]).find(t => {
			return currentPage["components"][t]["properties"]["controlID"] === controlID;
		});
		if (!widgetId) { //For item controls, there will not be controlID and feature will be inside tab items so we implemented this logic.
			for (const component in currentPage["components"]) {
				const items = currentPage["components"][component]["properties"]["items"];
				if (Array.isArray(items)) {
					items.some(item => {
						if (item["content"] && item["content"]["controlID"] === controlID) {
							const pageBind = currentPage["pageBinding"][item["name"]];
							widgetId = pageBind && pageBind[feature] && item["name"];
							return widgetId;
						}
					});
				}
				if (!widgetId) { return widgetId; }
			}
		}
	}
	return widgetId;
};

export const getWidgetBySubscriberId = (currentPage, subscribeId) => {
	let widget = null;
	if (currentPage && subscribeId) {
		for (const w in currentPage["components"]) {
			if (w === subscribeId) {
				widget = currentPage["components"][w];
				return widget;
			} else {
				for (const component in currentPage["components"]) {
					const items = currentPage["components"][component]["properties"]["items"];
					if (items && Array.isArray(items)) {
						items.some((item, index) => {
							if (item && item["name"] === subscribeId) {
								const pageBind = currentPage["pageBinding"][item["name"]];
								widget = pageBind && currentPage["components"][component]["properties"]["items"][index];
								return widget;
							}
						});
					}
				}
			}
		}
	}
	return widget;
};

export const getSubscriberId = (currentPage, feature) => {
	return Object.keys(currentPage.pageBinding).filter(t => Object.keys(currentPage.pageBinding[t]).find(x => currentPage.pageBinding[t][x].name === feature));
};

export const getSubscriberWidgetControlId = (currentPage, providerControlId, feature, subscriberComponentProps?: any) => {
	let widgetId;
	if (currentPage && providerControlId && feature) {
		let subscribeId;
		const subscribeIds = getSubscriberId(currentPage, feature); //Object.keys(currentPage.pageBinding).filter(t => Object.keys(currentPage.pageBinding[t]).find(x => x === feature));
		if (Array.isArray(subscribeIds)) {
			subscribeIds.forEach(id => {
				if (currentPage.pageBinding[id]) {
					for (const featureKey in currentPage.pageBinding[id]) {
						const subsciberTypeId = currentPage.components[id].properties.typeId;
						const providerTypeId = currentPage.components[providerControlId].properties.typeId;
						const featureObj = currentPage.pageBinding[id][featureKey];
						if ((featureObj && featureObj["providerId"] === providerControlId) || providerTypeId === subsciberTypeId) {
							subscribeId = id;
							subscriberComponentProps && Object.assign(subscriberComponentProps, { ...currentPage.components[id].properties });
						}
					}
				}
			});
		}

		const subscribeWidget = getWidgetBySubscriberId(currentPage, subscribeId);
		return subscribeWidget && subscribeWidget["name"] ? subscribeWidget["name"] : null;
	}
	return widgetId;
};

export const getSubscriberControlIdWithTypeAndSchemaId = (currentPage, controlId, feature) => {
	if (currentPage && controlId && feature) {
		const subscribeIds = getSubscriberId(currentPage, feature); //Object.keys(currentPage.pageBinding).filter(t => Object.keys(currentPage.pageBinding[t]).find(x => x === feature));
		let subscribeId;
		for (const id of subscribeIds) {
			if (currentPage.pageBinding[id]) {
				for (const featureKey in currentPage.pageBinding[id]) {
					const featureObj = currentPage.pageBinding[id][featureKey];
					if (featureObj && controlId === `${featureObj["providerTypeId"]}_${featureObj["providerSchemaId"]}`) {
						subscribeId = id;
					}
				}
			}
		}
		const subscribeWidget = getWidgetBySubscriberId(currentPage, subscribeId);
		return subscribeWidget && subscribeWidget["name"] ? subscribeWidget["name"] : null;
	}
	return null;
};

export const getSubscriberControlIds = (page, providerControlId, feature) => {
	const subscriberIds = [];
	if (page && providerControlId && feature) {
		if (page.pageBinding[providerControlId]) {
			for (const featureKey in page.pageBinding[providerControlId]) {
				const featureObj = page.pageBinding[providerControlId][featureKey];
				const isSubscriber = (cKey) => featureObj && featureObj.name === feature && (cKey === featureObj.providerId
					|| cKey === `${featureObj["providerTypeId"]}_${featureObj["providerSchemaId"]}`);
				const subscriberId = Object.keys(page.components).find(isSubscriber);
				if (subscriberId) { subscriberIds.push(subscriberId); }
			}
		}
	}
	return subscriberIds;
};
