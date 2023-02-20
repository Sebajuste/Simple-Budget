import { useState } from "react";
import { View } from "react-native";
import { Button, Layout, Text, TextInput } from "react-native-rapi-ui";
import { Account, AccountDao } from "../../services/account";
import uuid from 'react-native-uuid';
import { StackActions } from "@react-navigation/native";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { DaoType } from "../../services/dao";

export function AccountScreen({navigation, route} : any) {

    const account : Account = route.params?.account;

    const [name, setName] = useState( account ? account.name: '');

    const [balance, setBalance] = useState( account ? `${account.balance}` : '0');

    const accountDao = DAOFactory.getDAOFromType<Account>(DaoType.ACCOUNT, DATABASE_TYPE);

    const saveHandler = () => {
        const balanceFloat = parseFloat(balance);
        const account = {
            _id: uuid.v4(),
            name: name,
            balance: balanceFloat,
            envelope_balance: balanceFloat,
        } as Account;

        console.log('account : ', account);

        accountDao.add(account).then(v => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        }).catch(err => {
            console.error(err);
        })

    };

    const deleteHandler = () => {

    };

    const formValid = name.trim().length > 0 && balance.trim().length > 0;

    return (
        <Layout style={{margin: 10}}>

            <View style={{margin: 2}}>
                <Text style={{ fontSize: 12 }}>Account name</Text>
                <TextInput
                    placeholder="Enter the account name"
                    value={name}
                    onChangeText={setName}
                />
            </View>

            <View style={{flex: 1, margin: 2}}>
                <Text style={{ fontSize: 12 }}>Amount</Text>
                <TextInput
                    placeholder="0.00"
                    value={balance}
                    onChangeText={setBalance}
                    keyboardType="numeric"
                />
            </View>

            <View style={{ flexDirection: 'row'}} >
                { account ? <Button style={{margin: 5, flexGrow: 1}} text="DELETE" status="danger" onPress={deleteHandler}></Button> : <></> }
                <Button style={{margin: 5, flexGrow: 1}} text="SAVE" status="primary" disabled={!formValid} onPress={saveHandler}></Button>
            </View>

        </Layout>
    );

}