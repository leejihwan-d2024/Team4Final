package kr.co.kh.measure_tmp;

import javax.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class PathData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pathId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "measurement_id")
    private MeasurementData measurementData;

    @Column(name = "LOCATION_X")
    private double locationX;

    @Column(name = "LOCATION_Y")
    private double locationY;

    @Column(name = "SAVE_TIME", nullable = false)
    private LocalDateTime saveTime;
}
