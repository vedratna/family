// Monorepo entry point — redirects to the mobile package
import { registerRootComponent } from "expo";
import App from "./packages/mobile/src/App";

registerRootComponent(App);
