package com.sb.study;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StudyService {
	@Autowired
	private StudyRepository studyRepository;
	
	public Member createMember(Member member){
		
		
		return studyRepository.save(member);
		
	}
}
