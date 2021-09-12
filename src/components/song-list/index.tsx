import React, { useState } from 'react';
import './style.less';
import {
    Menu,
    Item,
    useContextMenu
} from "react-contexify";
import { Input } from 'antd';

const MENU_ID = "list-menu";

export type IListItem = {
    id: string;
    name: string;
    songs: string[];
};

type ListItemProps = {
    active: boolean;
    info: IListItem;
    onClick: (id: string) => void;
};

const ListItem: React.FC<ListItemProps> = (props) => {
    const { active, info, onClick } = props;
    return (
        <div
            className={`c-list-item${active ? ' active' : ''}`}
            onClick={() => onClick(info.id)}
        >
            {info.name}
        </div>
    );
};

type SongListProps = {
    list: IListItem[];
    currentListId: string;
    onChangeList: (name: string) => void;
    onAddList: (name: string) => void;
}

const SongList: React.FC<SongListProps> = (props) => {
    const { list, currentListId, onChangeList, onAddList } = props;
    const [showInput, setShowInput] = useState(false);
    const { show } = useContextMenu({
        id: MENU_ID,
    });

    const handleAddList = (e: any) => {
        const name = e.target.value;
        if (name) {
            onAddList(name)
        }
        setShowInput(false);
    }

    return <div className="c-song-list" onContextMenu={show}>
        {list.map(listItem =>
            <ListItem
                key={listItem.id}
                active={currentListId === listItem.id}
                info={listItem}
                onClick={onChangeList}
            />
        )}
        {showInput ? (
            <Input
                autoFocus
                onPressEnter={handleAddList}
                onBlur={handleAddList}
            />
        ) : null}
        <Menu id={MENU_ID}>
            <Item onClick={() => setShowInput(true)}>
                新建歌单
            </Item>
        </Menu>
    </div>
};

export default SongList;