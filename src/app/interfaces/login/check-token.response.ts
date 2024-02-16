import { User } from "./user.interfaces";

export interface checkTokenResponse {
    user:  User;
    token: string;
}