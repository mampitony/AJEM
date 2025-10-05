// navigation/UserNavigator.js
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import RevenuScreen from "../screens/RevenuScreen";
import DepenseScreen from "../screens/DepenseScreen.js";
import HistoriqueScreen from "../screens/HistoriqueScreen.js";

const Drawer = createDrawerNavigator();

export default function UserDrawerNavigator() {
    return (
        <Drawer.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: "#0163d2" },
                headerTintColor: "#fff",
                headerTitleAlign: "center",
            }}
        >
            <Drawer.Screen
                name="Revenu"
                component={RevenuScreen}
                options={{ title: "Revenu" }}
            />
            <Drawer.Screen
                name="Depenses"
                component={DepenseScreen}
                options={{ title: "Depenses" }}
            />
            <Drawer.Screen
                name="Historique"
                component={HistoriqueScreen}
                options={{ title: "Historique" }}
            />
        </Drawer.Navigator>
    );
}
