import { getDefaultRegistry, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import { Toast } from 'react-bootstrap';
import { getTextValueString } from "../../utils/helper";

class NotificationPopupControl extends React.Component {

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	render() {
		const { action, message, visibility, metadata, onClose, handleAction, className, style } = this._getControlSchemaProperties();
		if (visibility) {
			return <div className={className ? `toast-root ${className}` : "toast-root"} style={style ? style : {}}>
				<Toast
					style={{ display: "flex" }}
					show={visibility}
					delay={metadata.delay ? metadata.delay : 3000}
					autohide={action && action.showCloseIcon ? false : true}
					onClose={() => onClose()}
				>
					<Toast.Body className={`snackbar-${message.type}`}>
						<span id="message-id">{getTextValueString(message.text)}</span>
					</Toast.Body>
					{action && action.showCloseIcon && <Toast.Header className="close-icon" />}
				</Toast>
			</div>
		}
		return null;
	}
}

NotificationPopupControl["displayName"] = "NotificationPopupControl";
WidgetsFactory.instance.registerFactory(NotificationPopupControl);
WidgetsFactory.instance.registerControls({
	notification_popup_ui: "NotificationPopupControl",
	'itsy:ui:notification': "NotificationPopupControl"
});
