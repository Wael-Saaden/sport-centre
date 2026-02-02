package com.sportscenter.activity.service;

import com.sportscenter.activity.dto.ActivityDTO;
import com.sportscenter.activity.entity.Activity;
import com.sportscenter.activity.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    public ActivityDTO createActivity(ActivityDTO dto) {
        Activity activity = new Activity();
        activity.setName(dto.getName());
        activity.setDescription(dto.getDescription());
        activity.setCoach(dto.getCoach());
        activity.setMaxCapacity(dto.getMaxCapacity());
        activity.setStartTime(dto.getStartTime());
        activity.setEndTime(dto.getEndTime());
        activity.setCurrentParticipants(dto.getCurrentParticipants() != null ? dto.getCurrentParticipants() : 0);

        Activity saved = activityRepository.save(activity);
        return convertToDTO(saved);
    }

    public ActivityDTO getActivity(Long id) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activité non trouvée: " + id));
        return convertToDTO(activity);
    }

    public List<ActivityDTO> getAllActivities() {
        return activityRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ActivityDTO updateActivity(Long id, ActivityDTO dto) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activité non trouvée: " + id));

        activity.setName(dto.getName());
        activity.setDescription(dto.getDescription());
        activity.setCoach(dto.getCoach());
        activity.setMaxCapacity(dto.getMaxCapacity());
        activity.setStartTime(dto.getStartTime());
        activity.setEndTime(dto.getEndTime());
        if (dto.getCurrentParticipants() != null) {
            activity.setCurrentParticipants(dto.getCurrentParticipants());
        }

        Activity updated = activityRepository.save(activity);
        return convertToDTO(updated);
    }

    public void deleteActivity(Long id) {
        activityRepository.deleteById(id);
    }

    private ActivityDTO convertToDTO(Activity activity) {
        ActivityDTO dto = new ActivityDTO();
        dto.setId(activity.getId());
        dto.setName(activity.getName());
        dto.setDescription(activity.getDescription());
        dto.setCoach(activity.getCoach());
        dto.setMaxCapacity(activity.getMaxCapacity());
        dto.setCurrentParticipants(activity.getCurrentParticipants());
        dto.setStartTime(activity.getStartTime());
        dto.setEndTime(activity.getEndTime());
        return dto;
    }

}
