package com.sb.order;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.entity.Order;

@Service
@Transactional
public class OrderService {

	@Autowired
	OrderRespository orderRespository;
	
	
	public Order saveOrderItem(Order order){
		return orderRespository.save(order);
	}
}
