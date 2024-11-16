import { Alert, AlertDescription, AlertIcon, AlertTitle, CloseButton, Flex, Icon, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { BiPoll } from "react-icons/bi";
import { BsLink45Deg, BsMic } from "react-icons/bs";
import { IoDocumentText } from "react-icons/io5";
import TabItem from "./TabItem";
import TextInputs from './PostForm/TextInputs';
import ImageUpload from './PostForm/ImageUpload';
import { Post } from '@/atoms/postsAtom';
import { User } from 'firebase/auth';
import { useRouter } from 'next/router';
import { addDoc, collection, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { firestore, storage } from '@/firebase/clientApp';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';


// Define the renamed type to avoid conflict with the TabItem component
export type TabItemType = {
    title: string;
    icon: typeof Icon.arguments;
};


type NewPostFormProps = {
    user: User;
};


const formTabs: TabItemType[] = [
    {
        title: "Post",
        icon: IoDocumentText
    },
    {
        title: "Images & Video",
        icon: IoDocumentText
    },
    {
        title: "Link",
        icon: BsLink45Deg
    },
    {
        title: "Poll",
        icon: BiPoll
    },
    {
        title: "Talk",
        icon: BsMic
    },
];


const NewPostForm: React.FC<NewPostFormProps> = ({ user }) => {
    const router = useRouter();
    const [selectedTab, setSelectTab] = useState(formTabs[0]. title)
    const [textInputs, setTextInputs] = useState({
        title:"",
        body:"",
    });
    const [selectedFile, setSelectedFile] = useState<string>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleCreatePost = async () => {

        const { communityId } = router.query;
       // create new post object => type post

       const newPost : Post = {
           communityId: communityId as string,
           creatorId: user.uid,
           creatorDisplayname: user.email!.split("@")[0],
           title: textInputs.title,
           body: textInputs.body,
           numberOfComments: 0,
           voteStatus: 0,
           createdAt: serverTimestamp() as Timestamp,
           id: ''
       }
       
       setLoading(true);
       try{

        // store post in db
        const postDocRef = await addDoc(collection(firestore, "posts"), newPost)

        // check for selectedFile
            if (selectedFile){
                // store in storage -> getDownloadURL (return imageURL)
               const imageRef = ref(storage, "posts/${postDocRef.id}/image") 
               await uploadString(imageRef, selectedFile, "data_url")
               const downloadURL = await getDownloadURL(imageRef)

                // update post in doc by adding imageURL
                await updateDoc(postDocRef, {
                    imageURL: downloadURL,
                })

            }

            // redirect the user back to the communityPage using the router
       router.back();

       } catch (error: any) {
        console.log("handleCreatePost error", error.message);
        setError(true);
       }
       setLoading(false);

    };

    const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const reader= new FileReader();

        if(event.target.files?.[0]) {
          reader.readAsDataURL(event.target.files[0])  
        }

        reader.onload = (readerEvent) => {
            if (readerEvent.target?.result) {
                setSelectedFile(readerEvent.target.result as string)
            }
        }
    };

    const OnTextChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const {target: {name, value },
    } = event; 
    setTextInputs(prev => ({
        ...prev,
        [name]: value,
    }))
    };

    return ( 
        <Flex direction="column" bg="white" borderRadius={4} mt={2}>
            <Flex width="100%">
                {formTabs.map((item) => (
                    <TabItem
                    key={item.title}
                    item={item}
                    selected={item.title === selectedTab}
                    setSelectedTab={setSelectTab}
                    />
                ))}
            </Flex>
            <Flex p={4}>
                {selectedTab === "Post" && (
                
               <TextInputs 
               textInputs={textInputs} 
               handleCreatePost={handleCreatePost} 
               onChange={OnTextChange}
               loading={loading}
               /> 
                )}
                {selectedTab === 'Images & Video'  && <ImageUpload 
                     selectedFile={selectedFile} 
                    onSelectImage={onSelectImage} 
                    setSelectedTab={setSelectTab} 
                    setSelectedFile={setSelectedFile}
                />
            }
            </Flex>
            {error && (
            <Alert status="error">
            <AlertIcon /> 
            <Text mr={2}>Error in creating post</Text>
            </Alert>
            )}
        </Flex>
    );
};
export default NewPostForm;