package com.sb.study;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.study.entity.Member;

@Service
@Transactional
public class StudyService {
	@Autowired
	private StudyRepository studyRepository;
	
	public Member createMember(Member member){
		
		return studyRepository.save(member);
		
	}
	
	public Member getMember(Long id){
		return studyRepository.findOne(id);
	}
}
