package com.sb.study;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sb.study.entity.Member;


public interface StudyRepository extends JpaRepository<Member,Long>{

}
