import { defaultLoginSchema, defaultSignupSchema } from "./defaultSchema";

export const getLoginSchema = (showForgotPasswordButton = false, showSignupButton = false, signupFormSchemaId, logo) => {
    const loginSchemaProps = {
        ...defaultLoginSchema.properties,
        showForgotPasswordButton: showForgotPasswordButton,
        showSignupButton: showSignupButton,
        signupFormSchemaId: signupFormSchemaId,
        logo: logo,
    };

    return {
        "name": defaultLoginSchema.name,
        "properties": {
            ...loginSchemaProps,
        },
    };
}

export const getSignupSchema = (logo) => {
    const signupSchema = {
        ...defaultSignupSchema.properties,
        logo: logo,
    }
    return {
        "name": defaultSignupSchema.name,
        "properties": {
            ...signupSchema,
        },
    };
}