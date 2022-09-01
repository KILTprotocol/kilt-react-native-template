import React, {useState} from 'react';
import { Button, Text, TextInput, View } from 'react-native'
import { TailwindProvider } from 'tailwindcss-react-native';
import {init, Did} from "@kiltprotocol/sdk-js"

const  Profile = ({ navigation }) => {
    // text
    const td= {
        "first": {
            "header": "Personal Information",
            "sub": "You might not want to share these informations, because another personal can use it to claim a ticket with your information."
        },
        "second": {
            "header": "Crypro wallet",
            "sub": "The whole point of these word word is to ensure crypto wallet can be accessed if the password lost."
        },
        "last": {
            "header": "Crypto wallet",
            "sub": "Account is set up."
        }
    }
    // state
    const [name, setName] = useState("")
    const [age, setAge] = useState(0)
    const [isSaved, setIsSaved] = useState(false)
    const [last, setLast] = useState(false)
    const [log, setLog] = useState("")
    const [mnemonic, setMnemonic] = useState(["start", "", "", "", "", "", "", "", "", "", "", "end",])

    // handle Save button
    const handleSave= async () => {
        // actions to generate the mnemonic and the lightDID
        const response = await fetch("https://wilt-attester.vercel.app/api/claimer/mnemonic")
        const resp = await response.json()
        setMnemonic(resp.response)
        setIsSaved(true)
    }
    const handleDone = () => {
        setLast(true)
    }
    const handleLast = () => {
        navigation.navigate("Ticket", {
            params: {setting: "done", name: name, age: age, mnemonic}
        })
    }



    return (
      <TailwindProvider>
        <View className="flex-1 items-center mt-10">
            <Text className="font-bold text-3xl">
                {
                    (!isSaved)
                    ? td.first.header
                    : 
                    <Text>
                        {(last) ? td.last.header : td.second.header}
                    </Text>
                }
            </Text>
            <Text className="text-slate-600 mt-5 mx-10">
                {
                    (!isSaved)
                    ? td.first.sub
                    : 
                    <Text>
                        {(last) ? td.last.sub : td.second.sub}
                    </Text>
                }
            </Text>

            

            {/* ------------------------------------------------------ */}
            {
                (!isSaved) 
                ?
                (
                <View className="w-full flex items-center">
                    {/* NAME INPUT */}
                    <Text className="self-start text-indigo-500 mt-20 mx-10 text-base">Full Name </Text>
                    <TextInput className="h-14 w-4/5 rounded bg-white text-indigo-800 text-lg font-medium pb-4 pl-2 focus:border-2 focus:border-slate-200" 
                        blurOnSubmit={true}
                        maxLength={32}
                        returnKeyType="done"
                        onChangeText={setName}
                        value={name}
                    />
                    <Text className="self-end text-gray-400 mx-10 ">e.g. John Doe </Text>

                    {/* AGE INPUT */}
                    <Text className="self-start text-indigo-500 mt-5 mx-10 text-base">Age </Text>
                    <TextInput className="h-14 w-4/5 rounded bg-white text-indigo-800 text-lg font-medium pb-4 pl-2 focus:border-2 focus:border-slate-200" 
                        blurOnSubmit={true}
                        keyboardType={"numeric"}
                        maxLength={2}
                        returnKeyType="done"
                        onChangeText={setAge}
                        value={age}
                    />
                    <Text className="self-end text-gray-400 mx-10 ">e.g. 25 </Text>

                    <View className="w-4/5 h-14 bg-indigo-800 mt-10 rounded-full flex justify-center">
                        <Button className=" text-center text-lg font-medium" title='SAVE' color={"white"} onPress={handleSave}/>
                    </View>
                    {/* <Text>log-{log}</Text> */}
                    <Text className="self-start text-gray-500 mx-20 mt-10">{}</Text>
                </View>
                )
                :
                <View className="w-full flex items-center">
                    {
                        (last)
                        ?
                        <View className=" w-full flex items-center h-full">
                            <View className="w-4/5 h-14 px-10 bg-teal-800 rounded-full flex justify-center top-3/4 ">
                                <Button className=" text-center text-lg font-bold" title='Done' color={"white"} onPress={handleLast}/>
                            </View>

                        </View>
                        :
                        <View className="w-full flex flex-wrap justify-center flex-row gap-7 mt-10">
                        {mnemonic.map((word, idx) => (
                            <View className="bg-teal-200 w-40 rounded-full" key={idx}>
                                <Text className="self-center text-black py-2 font-semibold">({idx+1}) {word}</Text>
                            </View>
                        ))}
                        {/* <Text>log-{log}</Text> */}
                        <View className="w-4/5 h-14 bg-teal-800 mt-10 rounded-full flex justify-center">
                            <Button className=" text-center text-lg font-medium" title='Done' color={"white"} onPress={handleDone}/>
                        </View>
                    </View>
                    }
                </View>
            }


        </View>
        
      </TailwindProvider> 
    )
  }

  export default Profile