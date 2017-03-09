package com.sb.item;

import org.springframework.data.repository.CrudRepository;

import com.sb.entity.Item;

public interface ItemRepository extends CrudRepository<Item, Long>{

}
