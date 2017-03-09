package com.sb.member;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.entity.Member;

//@Service
//@Transactional
public class MemberService {
	@Autowired
	private MemberRepository memberRepository;
	
	public Member createMember(Member member){
		
		return memberRepository.save(member);
		
	}
	
	public Member getMember(Long id){
		return memberRepository.findOne(id);
	}
	
	public void deleteMember(Long id){
		memberRepository.delete(id);
	}
}
