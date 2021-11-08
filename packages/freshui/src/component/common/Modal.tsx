import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, SchemaContainer, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import { Button, Modal } from "react-bootstrap";

type ModalUIControlProps = IWidgetControlProps;

const RenderFooter = (props) => {
    const button = [];
    if (props.showCancelButton) {
        button.push(
            <Button className="cancel-btn" variant="secondary" key="" size="lg" onClick={props.onCancel} style={{ margin: 8 }}>
                {props.cancelText}
            </Button>);
    }
    if (props.showOKButton) {
        button.push(
            <Button key="submit" size="lg" variant="primary" color="primary" onClick={props.onOk} style={{ margin: 8 }}>
                {props.okText}
            </Button>);
    }
    return <>
        {button}
    </>;
};

class ModalUI extends React.Component<ModalUIControlProps, {}> {


    onEscape(e) {
        if (e.keyCode === 27) {
            const { onCancelModal } = this._getControlSchemaProperties();
            onCancelModal();
        }
    }

    _getControlSchemaProperties() {
        const registry = getDefaultRegistry();
        const { definitions } = registry;
        const schema = retrieveSchema(this.props.schema, definitions);
        return schema;
    }

    handleOk() {
        const { onOkModal } = this._getControlSchemaProperties();
        onOkModal();
    }

    handleCancel() {
        const { onCancelModal } = this._getControlSchemaProperties();
        onCancelModal();
    }

    render() {
        const { title, visible, width, dialogMessage, controlSchema, okText, cancelText, showOKButton, showCancelButton, closable, className, style } = this._getControlSchemaProperties();
        const fullScreen = width ? width : "sm";
        return (
            <Modal className={className ? `Modal-Box ${className}` : "Modal-Box"}
                style={style ? style : undefined}
                show={visible}
                size={fullScreen}>
                <Modal.Header id="dialog-title"
                    closeButton={closable ? closable : false}
                    onClick={closable ? this.handleCancel.bind(this) : null}>
                    <div className="modal-title-container">
                        <Modal.Title className="modal-box-title">
                            {title}
                        </Modal.Title>
                    </div>
                </Modal.Header>
                <Modal.Body className="modal-dialog-box">
                    <SchemaContainer className="drawer-form-box" schema={controlSchema} />
                </Modal.Body>
                <Modal.Footer className="drawer-button-container">
                    {
                        <RenderFooter okText={okText} cancelText={cancelText} showOKButton={showOKButton} showCancelButton={showCancelButton} onOk={this.handleOk.bind(this)} onCancel={this.handleCancel.bind(this)} />
                    }
                </Modal.Footer>
            </Modal>
        );
    }
}

ModalUI["displayName"] = "ModalUI";

WidgetsFactory.instance.registerFactory(ModalUI);
WidgetsFactory.instance.registerControls({
    modal_control: "ModalUI",
    "itsy:ui:modal": "ModalUI"
});
