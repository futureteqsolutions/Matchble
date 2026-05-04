import React from 'react';
import { useMessageContext, useChatContext } from 'stream-chat-react';

const CustomMessage = (props) => {
  const { message } = useMessageContext();
  const { client } = useChatContext();

  if (!message) return null;

  const isOwn = client?.userID === message.user?.id;
  const status = message.status;
  const isRead = status === 'read';
  const showTicks = isOwn && status !== 'sending' && status !== 'failed';

  const getTicks = () => {
    if (!showTicks) return null;
    if (isRead) return '✓✓';
    return '✓';
  };

  return (
    <div className={`flex w-full mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <div className="avatar mr-2 flex-shrink-0 self-end mb-1">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
            <img
              src={message.user?.image || `https://ui-avatars.com/api/?name=${(message.user?.name || 'U').replace(/ /g, '+')}&background=random&color=fff&size=32&rounded=true&bold=true&font-size=0.5`}
              alt={message.user?.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
      <div className={`relative max-w-[70%] px-3 py-1.5 rounded-2xl shadow-sm flex flex-col ${isOwn ? 'bg-[#dcf8c6] rounded-br-sm' : 'bg-white rounded-bl-sm'}`}>
        {!isOwn && (
          <span className="text-xs font-semibold text-pink-500 mb-1">{message.user?.name}</span>
        )}
        <div className="break-words text-sm leading-relaxed pr-4 text-black">
          {message.text?.replace(/\\n/g, ' ').replace(/\n/g, ' ')}
        </div>
        {message.type === 'voice' && (
          <div className="voice-message mt-1 p-2 bg-gray-100 rounded-lg flex items-center gap-2">
            <span className="text-sm text-gray-500">Voice message</span>
          </div>
        )}
        <div className={`flex items-end ${isOwn ? 'justify-end' : 'justify-start'} mt-0.5`}>
          <span className="!text-[10px] !text-[#667781] !font-normal">
            {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
          {isOwn && (
            <span className={`ml-1 text-[10px] ${isRead ? 'text-[#53bdeb]' : 'text-[#667781]'}`}>
              {getTicks()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomMessage;
