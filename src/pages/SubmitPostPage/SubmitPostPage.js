/** @jsx jsx */
import React from 'react';
import { Storage, API, graphqlOperation } from 'aws-amplify';
import { PhotoPicker } from 'aws-amplify-react';
import awsCustomTheme from '../../awsCustomTheme';
import { Button } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { genUUID, getISODate } from '../../utils';
import { useHistory } from "react-router"
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';
import { LoggedInUserContext } from '../../user-context';
import PicUploader from '../../components/PicUploader/PicUploader';

const StyledPageWrapper = styled.div`
  padding: 40px 0;
  margin: 0 auto;
  
  @media(max-width: 768px) {
    padding: 0;
  }
`;

const StyledDiv = styled.div`
  margin: 0 auto;
  text-align: center;
  max-width: 400px;
  padding: 0 5px;
`;

const StyledH2 = styled.h2`
  color: tomato;
`;


function SubmitPostPage() {
  const [imgFile, changeImgFile] = React.useState();
  const [imgKey, changeImgKey] = React.useState();
  const [isTooBig, changeIsTooBig] = React.useState();
  const { loggedInUserData } = React.useContext(LoggedInUserContext);
  const history = useHistory();
  
  const handlePick = data => {
    console.log(data);
    if (data.size > 3000000) {
      changeIsTooBig(true);
      changeImgKey(null);
    } else {
      changeIsTooBig(false);
      console.log(data.file);
    }
  }
  
  const handleSave = e => {
    Storage.put(`${loggedInUserData.id}/${genUUID()}-${imgFile.name}`, imgFile, {
      level: 'public',
      contentType: imgFile.type
    })
    .then (result => {

      const createPost = `
        mutation CreatePost(
          $input: CreatePostInput!
          $condition: ModelPostConditionInput
        ) {
          createPost(input: $input, condition: $condition) {
            id
            picUrl
            type
            visibility
            timeCreated
            userId
          }
        }
      `;

      let createPostInput = {
        id: `postid:${genUUID()}`,
        picUrl: result.key,
        type: "post",
        visibility: "public",
        userId: loggedInUserData.id,
        timeCreated: getISODate()
      };

      API.graphql(graphqlOperation(createPost, {input: createPostInput}))
        .then(res => {history.push("/")})
        .catch(err => {console.log(err)})
    })
    .catch(err => console.log(err)); 
  }
  
  return (
    <StyledPageWrapper>
      <StyledDiv>
        <PicUploader changeImgFile={changeImgFile} />
        <Button 
          block 
          onClick={handleSave} 
          disabled={imgFile ? false : true} 
          type="primary" size="large"
        >
          <SaveOutlined />
          Submit
        </Button>
      </StyledDiv>
    </StyledPageWrapper>
  )
}

export default SubmitPostPage;