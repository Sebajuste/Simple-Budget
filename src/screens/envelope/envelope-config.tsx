import { StackActions, useIsFocused } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Layout, Picker, Text, TextInput } from "react-native-rapi-ui";
import uuid from 'react-native-uuid';
import _ from "lodash";

import { SelectDateComponent } from "../../components/select-date";
import { budgetPerMonth, Envelope, Period, periodFromString, periodToString } from "../../services/envelope";
import { Category } from "../../services/category";
import { DaoType } from "../../services/dao";
import { t } from "../../services/i18n";
import { styles_form } from "../../styles";
import { DeleteConfirmModal } from "../../components/modal";
import { DatabaseContext } from "../../services/db-context";


const operation_type_picker_items = [
    { label: 'Month', value : "MONTHLY" },
    { label: 'Trimester', value : "TRIMESTER" },
    { label: 'Semester', value : 'SEMESTER' },
    { label: 'Year', value : 'YEARLY' },
];



export function EnvelopeConfigScreen({ navigation, route } : {navigation : any, route : any}) {

    const category : Category | null = route.params?.category;

    const envelope : Envelope = route.params?.envelope || {
        _id: uuid.v4(),
        name: '',
        amount: 0,
        funds: 0,
        period: Period.MONTHLY,
        dueDate: new Date(),
        category_id: category?._id || '' // 
    } as Envelope;

    const updateForm = route.params?.envelope || false ? true : false;

    const [loading, setLoading] = useState(false);

    const [name, setName] = useState( envelope ? envelope.name : '');

    const [amount, setAmount] = useState( envelope ? `${envelope.amount}` : '');

    const [categoryID, setCategoryID] = useState( envelope ? `${envelope.category_id}` : '' );

    const [period, setPeriod] = useState(  envelope ? envelope.period : Period.MONTHLY );

    const [dueDate, setDueDate] = useState( envelope && envelope.dueDate ? (typeof envelope.dueDate === 'string' ? new Date(envelope.dueDate) : envelope.dueDate) : new Date() );

    const [categoryItems, setCategoryItems] = useState<any[]>([]);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const { dbManager } = useContext(DatabaseContext);

    const envelopeDao = dbManager.getDAOFromType<Envelope>(DaoType.ENVELOPE);
    const categoryDao = dbManager.getDAOFromType<Category>(DaoType.CATEGORY);

    const isFocused = useIsFocused();

    const addHandler = () => {

        if( period == Period.MONTHLY ) {
            dueDate.setDate(1)
        }

        const envelope : Envelope = {
            _id: uuid.v4(),
            name: name,
            amount: parseFloat(amount),
            funds: 0,
            period: period,
            dueDate: dueDate,
            category_id: categoryID
        } as Envelope;

        envelopeDao.add(envelope).then(v => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        });

    };

    const updateHandler = () => {

        const envelopeUpdate = {
            _id: envelope._id,
            name : name,
            amount : parseFloat(amount),
            period :  period,
            dueDate : dueDate,
            funds : envelope.funds,
            category_id : envelope.category_id
        } as Envelope;

        envelopeDao.update(envelopeUpdate).then(v => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        }).catch(console.error);

    }

    const openDeleteHandler = () => {
        setDeleteModalVisible(true);
    };

    const deleteHandler = () => {
        envelopeDao.remove(envelope).then(v => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        }).catch(err => {
            console.error(err);
        });
    };

    const newCategoryHandler = () => {
        navigation.navigate('CreateCategory');
    };

    useEffect(() => {
        setLoading(true);
        categoryDao.load().then( categories => {
            return categories.map(category => {
                return {
                    label: `${category.name}`,
                    value: `${category._id}`
                };
            });
        } ).then(setCategoryItems)//
        .finally(() => {
            setLoading(false);
        }).catch(console.error);
    }, [isFocused]);


    if( loading ) {
        return <Text>Loading</Text>;
    }

    console.log('render EnvelopeListItem ', envelope.name, envelope);

    const now = new Date();

    const formValid = name.trim().length > 0 && amount.trim().length > 0 && parseFloat(amount) != 0;

    return (
        <Layout style={{margin: 10}}>

            <DeleteConfirmModal options={{title: 'Confirm Delete'}} visible={deleteModalVisible} onCancel={() => setDeleteModalVisible(false)} onConfirm={() => deleteHandler()} />
        
            <View style={styles_form.container}>

                <View style={styles_form.row}>

                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{flex: 1, fontSize: 12 }}>{ t('forms:envelope_name') }</Text>
                        <TextInput
                            style={{flex: 1}}
                            placeholder={ t('forms:enter_envelope_name') }
                            value={name}
                            onChangeText={(val) => setName(val)}
                        />
                    </View>

                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{flex: 1, fontSize: 12 }}>{t('common:amount_budget')}</Text>
                        <TextInput
                            style={{flex: 1}}
                            placeholder="0.00"
                            value={amount}
                            onChangeText={(val) => setAmount(val)}
                            keyboardType="numeric"
                        />
                    </View>

                </View>

                <View style={styles_form.row}>
                    <View style={{flex: 1, margin: 2 }}>
                        <Text style={{ fontSize: 12 }}>{t('common:category')}</Text>
                        <Picker placeholder={t('common:category')} items={categoryItems} value={ categoryID } onValueChange={setCategoryID} />
                    </View>
                    <View style={{flex: 1, margin: 4, alignItems: 'flex-end', justifyContent: 'center', flexDirection: 'row'}}>
                        <Button text={t('buttons:category_new')} onPress={newCategoryHandler} />
                    </View>
                </View>

                <View style={styles_form.row}>

                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{ fontSize: 12 }}>{t('common:budget_period')}</Text>
                        <Picker placeholder={t('common:period')} items={operation_type_picker_items} value={ periodToString(period) } onValueChange={(val: string) =>  setPeriod( periodFromString(val) )} ></Picker>
                    </View>

                    <View style={{flex: 1, margin: 10}}>
                        <Text style={{ flex: 1, alignItems: "flex-end", textAlignVertical: 'bottom', color: '#888'}}>{ budgetPerMonth(parseFloat(amount), period).toFixed(2) } </Text>
                        <Text style={{ flex: 1, fontSize: 12, color: '#888', textAlignVertical: 'center' }}>{t('common:montly')}</Text>
                    </View>

                </View>
                <View>

                    <View>
                        <SelectDateComponent label={t('common:due_date')} date={dueDate} minimumDate={now} onChange={(newDate: Date) => setDueDate(newDate) } />
                    </View>

                </View>


            </View>

            <View style={{ flexDirection: 'row'}} >
                { updateForm ? <Button style={{margin: 5, flexGrow: 1}} text={t('common:delete')} status="danger" disabled={ envelope.funds > 0 } onPress={() => setDeleteModalVisible(true)}></Button> : <></> }
                <Button style={{margin: 5, flexGrow: 1}} text={t('common:save')} status="primary" disabled={!formValid} onPress={updateForm ? updateHandler : addHandler}></Button>
            </View>
            
        </Layout>
    );

}




