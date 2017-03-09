package com.sb.member;

import org.springframework.data.repository.CrudRepository;

import com.sb.entity.Member;


public interface MemberRepository extends CrudRepository<Member,Long>{

}
