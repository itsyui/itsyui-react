import { ItsyContainer, ItsyRow } from "@itsy-ui/layout";
import { ItsyNavbar } from "@itsy-ui/navigation";
import logo from "../logo.svg";

/**
 * Navbar schema to render the top bar
 */
const navBarSchema = {
    data: {
        items: [
            {
                id: "back_home",
                title: "ItsyUI",
                appIcon: logo
            }
        ],
        rightItems: [{
            isPrimary: true,
            icon: "power_settings_new",
            id: "logout"
        }]
    }
};

const Layout = (props) => {
    return <ItsyContainer>
        <ItsyRow>
            <ItsyNavbar schema={navBarSchema} />
        </ItsyRow>
        <ItsyRow hAlignment="center" padding="15px">
            {props.children}
        </ItsyRow>
    </ItsyContainer>
}

export default Layout;