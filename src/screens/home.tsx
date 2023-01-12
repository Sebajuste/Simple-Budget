import { SafeAreaView, ScrollView, View } from "react-native";
import { Button, Text } from "react-native-rapi-ui";
import { clearAsyncStorageDB } from "../services/async_storage/async_storage";
import { Envelope } from "../services/budget";
import { Transaction, TransactionType } from "../services/transaction";
import { scroll_styles } from "../styles";
import PaiementListView from "./paiment/paiment-list-view";
import uuid from 'react-native-uuid';
import { useEffect, useState } from "react";
import { TransactionDaoStorage } from "../services/async_storage/transaction_async_storage";
import _ from "lodash";
import { EnvelopeDaoStorage } from "../services/async_storage/budget_async_storage";
import { AccountDaoStorage } from "../services/async_storage/account_async_storage";
import { SettingsDaoStorage } from "../services/async_storage/settings_async_storage";


async function checkDatabase() {
  const transactionDao = new TransactionDaoStorage();
  const envelopeDao = new EnvelopeDaoStorage();
  const accountDao = new AccountDaoStorage();

  /*
  const total_fill = await transactionDao.load()//
    .then(transactions => _.filter(transactions, transaction => transaction.transactionType == TransactionType.FILL) )//
    .then(transactions => _.sum(_.map(transactions, transaction => transaction.amount ) ) );
  */
 
  const total_funds = await envelopeDao.load().then(envelopes => _.sum(_.map(envelopes, envelope => envelope.funds )) );

  const total_account_filled = await accountDao.load()//
    .then(accounts => _.map(accounts, account => account.balance - account.envelope_balance))//
    .then(totals => _.sum(totals));

  // console.log('total_fill: ', total_fill, ', total_funds: ', total_funds, ', total_account_filled: ', total_account_filled);
  
  return total_account_filled == total_funds;
}

export default function HomeScreen({navigation} : any) {

    const [databaseCheck, setDatabaseCheck] = useState(false);

    const clearDatabaseHandler = () => {
        clearAsyncStorageDB();
    };

    const paimentHandler = (envelope : Envelope) => {
      // navigation.navigate('', {par});

      const transaction = {
        _id: uuid.v4(),
        name: `Paiement ${envelope.name}`,
        transactionType: TransactionType.PAIMENT,
        amount: envelope.amount,
        envelope_id: envelope._id,
        date: new Date().toISOString() as any,
      } as Transaction;

      navigation.navigate({name: 'Transaction', params: {transaction: transaction} });
    };

    const startTuto = () => {
      navigation.navigate({name: 'TutoScreen'});
    };

    useEffect(() => {

      checkDatabase().then(setDatabaseCheck).catch(console.error);

      const settingsDao = new SettingsDaoStorage();

      settingsDao.load().then(settings => {
        if( !settings.tuto_shown ) {
          startTuto();
        }
      });
      
    }, []);


    return (
      <SafeAreaView style={scroll_styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Home</Text>
          <Text>Check database : { databaseCheck ? 'OK': 'ERROR' }  </Text>
          <Button text="Clear Database" onPress={clearDatabaseHandler}></Button>
          <Button text="Start tuto" onPress={startTuto}></Button>
        </View>
        <View style={{ flex: 1, margin: 10 }}>
          <Text>Next paiements : </Text>
          <ScrollView style={scroll_styles.scrollView}>
            <PaiementListView onPaiement={paimentHandler} />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }