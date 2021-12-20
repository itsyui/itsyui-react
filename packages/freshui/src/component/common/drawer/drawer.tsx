import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, SchemaContainer, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import { Button, Form } from 'react-bootstrap';
import { getDeviceType } from '../../../utils/helper';

type DrawerUIControlProps = IWidgetControlProps;

class DrawerControl extends React.Component<DrawerUIControlProps, {}> {
	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	onClose = () => {
		const { onCloseDrawer } = this._getControlSchemaProperties();
		onCloseDrawer();
	}

	onOk = () => {
		const { onOkDrawer } = this._getControlSchemaProperties();
		onOkDrawer();
	}

	render() {
		const { title, width, visible, controlSchema, showOK, showCancel, okText, cancelText, className, style } = this._getControlSchemaProperties();
		const deviceType = getDeviceType()
		const matches = deviceType === "mobile" ? true : false;
		return (<>
			{visible && <div className={className ? `root-drawer ${className}` : "root-drawer"} style={style ? style : {}}>
				<div className="backdrop-drawer" />
				<div style={{ width: matches ? "100%" : width ? width : 350 }} className="drawer">
					<div className="drawer-header">
						<Form.Label className="drawer-title" tabIndex={0} aria-label={title}>{title}</Form.Label>
					</div>
					<div className="drawer-body" tabIndex={0}>
						<SchemaContainer className="drawer-form-box" schema={controlSchema} />
					</div>
					<div style={{ width: width ? width : 350 }} className="drawer-footer">
						{showCancel &&
							<div key="drawer_cancel_btn" >
								<Button variant="secondary" tabIndex={0} className="cancel-btn" onClick={this.onClose} aria-label={cancelText} >{cancelText}</Button>
							</div>
						}
						{showOK &&
							<div key="drawer_ok_btn" >
								<Button variant="primary" tabIndex={0} className="ok-btn" color="secondary" onClick={this.onOk} aria-label={okText} >{okText}</Button>
							</div>
						}
					</div>
				</div>
			</div>}
		</>
		);
	}
};

DrawerControl["displayName"] = "DrawerUIControl";

WidgetsFactory.instance.registerFactory(DrawerControl);
WidgetsFactory.instance.registerControls({
	drawer_control: "DrawerUIControl",
	"itsy:ui:drawer": "DrawerUIControl"
});