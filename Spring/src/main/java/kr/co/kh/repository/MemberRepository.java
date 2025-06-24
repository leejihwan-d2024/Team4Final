package kr.co.kh.repository;

import kr.co.kh.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MemberRepository extends JpaRepository<Member,Long> {


    List<Member> findByName(String name);
    //like
    //List<Member> findByNameContaining (String name);
    //숫자비교>
    //List<Member> findByAgeGreaterThan (int age);

    //
    //List<Member> findAllByAgeAsc ();

    //
    //List<Member> findByNameAscByAgeDesc ();

    //
    //List<Member> findByNameContainingAndAgeGreaterThan (String name,int age);

    //@Query("select * from member where name=:name and age > :age")
    //List<Member> findByNameAndAge(@Param("name") String name, @Param("age") int age);

    void deleteById(Long id);
}
