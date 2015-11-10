package com.sb.member;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sb.entity.Member;


public interface MemberRepository extends JpaRepository<Member,Long>{

}
