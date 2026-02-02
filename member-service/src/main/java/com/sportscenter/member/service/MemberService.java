package com.sportscenter.member.service;

import com.sportscenter.member.dto.MemberDTO;
import com.sportscenter.member.entity.Member;
import com.sportscenter.member.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MemberService {

    @Autowired
    private MemberRepository memberRepository;

    public MemberDTO createMember(MemberDTO dto) {
        Member member = new Member();
        member.setEmail(dto.getEmail());
        member.setFirstName(dto.getFirstName());
        member.setLastName(dto.getLastName());
        member.setPhone(dto.getPhone());

        Member saved = memberRepository.save(member);
        return convertToDTO(saved);
    }

    public MemberDTO getMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Membre non trouvé: " + id));
        return convertToDTO(member);
    }

    public List<MemberDTO> getAllMembers() {
        return memberRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public MemberDTO updateMember(Long id, MemberDTO dto) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Membre non trouvé: " + id));

        member.setFirstName(dto.getFirstName());
        member.setLastName(dto.getLastName());
        member.setPhone(dto.getPhone());

        Member updated = memberRepository.save(member);
        return convertToDTO(updated);
    }

    public void deleteMember(Long id) {
        memberRepository.deleteById(id);
    }

    private MemberDTO convertToDTO(Member member) {
        MemberDTO dto = new MemberDTO();
        dto.setId(member.getId());
        dto.setEmail(member.getEmail());
        dto.setFirstName(member.getFirstName());
        dto.setLastName(member.getLastName());
        dto.setPhone(member.getPhone());
        dto.setSubscriptionStatus(member.getSubscriptionStatus().toString());
        return dto;
    }

}
