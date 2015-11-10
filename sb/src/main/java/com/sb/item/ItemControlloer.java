package com.sb.item;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.sb.entity.Album;
import com.sb.entity.Item;

public class ItemControlloer {
	@Autowired
	ItemService itemService;
	
	
	@RequestMapping(value="/item/{id}" , method=RequestMethod.GET)
	public ResponseEntity<Item> getItem(Item item){
		return new ResponseEntity<Item>(itemService.getItem(item),HttpStatus.OK);
	}
	
	@RequestMapping(value="/item/album/save")
	public ResponseEntity<Album> saveItem(Album item){
		return new ResponseEntity<Album>(itemService.saveAlbum(item),HttpStatus.CREATED);
	}
}
