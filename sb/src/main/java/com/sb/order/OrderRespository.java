package com.sb.order;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sb.entity.Order;

public interface OrderRespository extends JpaRepository<Order, Long>{

}
