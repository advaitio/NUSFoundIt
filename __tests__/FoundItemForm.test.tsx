import FoundItemForm from "@/components/FoundItemForm";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { addDoc } from "firebase/firestore";
import React from "react";
import { Alert } from "react-native";

jest.mock("firebase/firestore", () => ({__esModule: true, addDoc: jest.fn().mockResolvedValue({}), collection: jest.fn(), serverTimestamp: jest.fn(), getFirestore: jest.fn(), connectFirestoreEmulator: jest.fn()}));
jest.mock("firebase/storage", () => ({__esModule: true, getDownloadURL: jest.fn(), ref: jest.fn(), uploadBytes: jest.fn(), getStorage: jest.fn(), connectStorageEmulator: jest.fn()}));
jest.mock("firebase/app", () => ({initializeApp: jest.fn()}));
jest.mock("react-native-element-dropdown", () => ({
    Dropdown: (props: any) => {
        const{TextInput} = require("react-native");
        return (
            <TextInput
                placeholder={props.placeholder}
                value={props.value}
                onChangeText={(text: string) => props.onChange({value: text})}/>
        );
    }
}));

jest.mock("@react-native-community/datetimepicker", () => {
    const { Button } = require("react-native");
    const React = require("react");
    return (props: any) => (
        <Button
            testID="mock-date-picker"
            title="mock-date"
            onPress={() => props.onChange({ type: "set" }, new Date("2026-07-20T12:00:00Z"))}
        />
    );
});

describe("FoundItemForm Form Submissions", () => {beforeEach(() => {jest.clearAllMocks();});
    beforeEach(() => {jest.clearAllMocks(); jest.spyOn(Alert, "alert").mockImplementation(() => {});});
    it("TC1, TC2, TC7", async () => {
        const { getByPlaceholderText, getByText, getByTestId, findByPlaceholderText } = await render(<FoundItemForm />);
        fireEvent.changeText(getByPlaceholderText("Item Name (Max 30 char.)"), "Macbook Pro");
        fireEvent.changeText(getByPlaceholderText("Category (select)"), "laptop");
        fireEvent.changeText(getByPlaceholderText("Description"), "Silver Macbook Pro");
        fireEvent.changeText(getByPlaceholderText("Location Found (e.g. LT17, The Deck)"), "COM1-0201");
        fireEvent.press(getByText("Date Found (select date)"));
        const datePicker = await waitFor(() => getByTestId("mock-date-picker"));
        fireEvent.press(datePicker);
        fireEvent.changeText(getByPlaceholderText("Contact Email"), "test@u.nus.edu");
        fireEvent.changeText(getByPlaceholderText("Contact Phone Number"), "12345678");
        const alertsText = getByText('Match Alerts (Optional)');
        const pressable = (alertsText as any).parent.parent; 
        fireEvent.press(pressable);
        const telegramInput = await findByPlaceholderText('Telegram Chat ID');
        const thresholdInput = await findByPlaceholderText('Minimum Match Score (e.g. 8)');
        fireEvent.changeText(telegramInput, '123456');
        fireEvent.changeText(thresholdInput, '5');
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(addDoc).toHaveBeenCalled();
            const submittedData = (addDoc as jest.Mock).mock.calls[0][1];

            expect(submittedData.itemName).toBe("Macbook Pro");
            expect(submittedData.telegramAlerts).toEqual({"123456": 5});
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 29);
            expect(submittedData.expireAt.getTime()).toBeGreaterThan(futureDate.getTime());
            expect(submittedData.contactEmail).toBe("test@u.nus.edu");
            expect(submittedData.contactPhoneNumber).toBe("12345678");

            expect(Alert.alert).toHaveBeenCalledWith("Success\n", "Your report has been submitted successfully.");
        });

        await waitFor(() => {
            expect(getByPlaceholderText("Item Name (Max 30 char.)").props.value).toBe("");
        })
    });

    it("TC3, TC8", async () => {
        const { getByPlaceholderText, getByText, getByTestId } = await render(<FoundItemForm />);
        fireEvent.changeText(getByPlaceholderText("Item Name (Max 30 char.)"), "Nike Sports Bottle");
        fireEvent.changeText(getByPlaceholderText("Category (select)"), "Water Bottle");
        fireEvent.changeText(getByPlaceholderText("Description"), "Black Nike Squeeze Bottle");
        fireEvent.changeText(getByPlaceholderText("Location Found (e.g. LT17, The Deck)"), "LT8");
        fireEvent.press(getByText("Date Found (select date)"));
        fireEvent.press(getByTestId("mock-date-picker"));
        fireEvent.changeText(getByPlaceholderText("Contact Email"), "test@u.nus.edu");
        fireEvent.changeText(getByPlaceholderText("Contact Phone Number"), "12345678");
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            const submittedData = (addDoc as jest.Mock).mock.calls[0][1];
            expect(submittedData.itemName).toBe("Nike Sports Bottle");
            expect(submittedData.telegramAlerts).toBeUndefined();
            expect(submittedData.imageUrl).toBe('');
        });

        await waitFor(() => {
            expect(getByPlaceholderText("Item Name (Max 30 char.)").props.value).toBe("");
        });
    });
});