package com.sb.item;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sb.entity.Item;

public interface ItemRepository extends JpaRepository<Item, Long>{

}
