import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import { Button, Modal } from "react-bootstrap";

type PopupUIControlProps = IWidgetControlProps;

const RenderFooter = (props) => {
	const button = [];
	if (props.popupType === 1) {
		button.push(null, <Button key="submit" variant="primary" size="lg" color="secondary" onClick={props.onOk} >
			{props.okText}
		</Button>);
	} else {
		button.push(
			<Button className="cancel-btn" variant="secondary" key="" size="lg" onClick={props.onCancel} style={{ margin: 8 }}>
				{props.cancelText}
			</Button>,
			<Button key="submit" variant="primary" size="lg" color="secondary" onClick={props.onOk} style={{ margin: 8 }}>
				{props.okText}
			</Button>
		);
	}
	return <>
		{button}
	</>;
};

class PopupControl extends React.Component<PopupUIControlProps, {}> {

	onEscape(e) {
		if (e.keyCode === 27) {
			const { onCancelPopup } = this._getControlSchemaProperties();
			onCancelPopup();
		}
	}

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	handleOk() {
		const { onOkPopup } = this._getControlSchemaProperties();
		onOkPopup();
	}

	handleCancel() {
		const { onCancelPopup } = this._getControlSchemaProperties();
		onCancelPopup();
	}

	render() {
		const { title, visible, closable, popupType, popupMessage, okText, cancelText, className, style } = this._getControlSchemaProperties();
		return (
			<Modal className={className ? `Modal-Box ${className}` : "Modal-Box"} style={style ? style : {}} onClick={this.handleCancel.bind(this)} onKeyUp={this.onEscape.bind(this)} show={visible}>
				<Modal.Header id="dialog-title" closeButton={closable ? closable : false}>
					<div className="modal-title-container">
						<Modal.Title className="modal-box-title">
							{title}
						</Modal.Title>
					</div>
				</Modal.Header>
				<Modal.Body>
					{popupMessage !== null && popupMessage}
				</Modal.Body>
				<Modal.Footer className="drawer-button-container">
					{
						<RenderFooter okText={okText} cancelText={cancelText} popupType={popupType} onOk={this.handleOk.bind(this)} onCancel={this.handleCancel.bind(this)} />
					}
				</Modal.Footer>
			</Modal>
		);
	}
}

PopupControl["displayName"] = "PopupControl";

WidgetsFactory.instance.registerFactory(PopupControl);
WidgetsFactory.instance.registerControls({
	popup_control: "PopupControl",
	"itsy:ui:popup": "PopupControl"
});
