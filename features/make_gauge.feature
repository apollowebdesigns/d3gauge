Feature: Must render gauge on a page
  Scenario: gauge renders
    Given I am on a page
    When I see a gauge
    Then I have a gauge

  Scenario: gauge changes
    Given I am on a page
    When I see a gauge
    And I wait for an age
    Then I have updated the gauge