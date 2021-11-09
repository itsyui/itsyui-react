import { WidgetsFactory } from "@itsy-ui/core";
import { createBrowserHistory } from "history";

const options = {
	basename: process.env.ITSY_APP_HREF === undefined ? "" : "/" + process.env.ITSY_APP_HREF,
};
const history = createBrowserHistory(options);

WidgetsFactory.instance.registerService({
	"history": history
});

export default history;