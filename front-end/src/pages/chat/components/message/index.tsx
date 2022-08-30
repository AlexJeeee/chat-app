import React from 'react';
import dayjs from 'dayjs';
import { Component, NickName, Time, Content } from './style';

interface Msg {
  nickName: string;
  text: string;
  createdDate: number;
}

interface Props {
  msg: Msg;
}

const Message: React.FC<Props> = (props) => {
  return (
    <Component>
      <NickName>
        {props.msg.nickName}
        <Time>{dayjs(props.msg.createdDate).format('HH:mm')}</Time>
      </NickName>
      <Content>{props.msg.text}</Content>
    </Component>
  )
}

export default Message;