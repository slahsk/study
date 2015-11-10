package com.sb.item;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.entity.Album;
import com.sb.entity.Item;

@Service
@Transactional
public class ItemService {
	@Autowired
	ItemRepository itemRepository; 
	
	
	public Item getItem(Item item) {
		return itemRepository.findOne(item.getId());
	}


	public Album saveAlbum(Album item) {
		return itemRepository.save(item);
	}

}
